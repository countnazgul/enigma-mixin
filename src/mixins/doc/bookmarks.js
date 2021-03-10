const { bookmarkList } = require("./object-definitions");

async function mGetBookmarksMeta(state = "$") {
  const sessionObject = await this.createSessionObject(bookmarkList);
  const sessionObjectLayout = await sessionObject.getLayout();
  const bookmarks = sessionObjectLayout.qBookmarkList.qItems;

  await this.destroySessionObject(sessionObject.id);

  return await Promise.all(
    bookmarks.map(async (bookmark) => {
      return await mGetBookmarkMeta(bookmark.qInfo.qId, state, this);
    })
  );
}

async function mGetBookmarkMeta(bookmarkId, state = "$", qApp = {}) {
  let app = qApp.type && qApp.type == "Doc" ? qApp : this;
  let bookmark = await app.getBookmark(bookmarkId);

  let [properties, layout, setAnalysisRaw] = await Promise.all([
    await bookmark.getProperties(),
    await bookmark.getLayout(),
    await app.getSetAnalysis(state, bookmarkId).catch((e) => {
      throw new Error(
        `Code: ${e.code}; Message: ${e.message}; Details: ${e.parameter}`
      );
    }),
  ]);

  let setAnalysisDestructed = destructSetAnalysis(setAnalysisRaw);

  return {
    properties,
    layout,
    setAnalysisRaw,
    setAnalysisDestructed,
  };
}

async function mCreateBookmarkFromMeta(
  bookmarkMeta,
  title,
  description = "",
  qApp = {}
) {
  if (!title) throw new Error("Bookmark title is required");
  let app = qApp.type && qApp.type == "Doc" ? qApp : this;

  await app.clearAll({ qLockedAlso: true });

  let makeSelections = await Promise.all(
    bookmarkMeta.setAnalysisDestructed.map(async (s) => {
      if (s.type == "list") return await selectListValues(app, s);

      if (s.type == "expression") return await selectExpressionValues(app, s);
    })
  );

  if (!makeSelections.every((v) => v === true)) {
    throw new Error(`Failed to make selection`);
  }

  let newBookmark = await app.createBookmark({
    qProp: {
      qInfo: {
        qType: "bookmark",
      },
      qMetaDef: {
        title: title,
        description: description,
      },
    },
  });

  return newBookmark.id;
}

async function mGetBookmarkValues(bookmarkId, state = "$") {
  return await mGetBookmarkMeta(bookmarkId, state, this).then((b) => {
    return b.setAnalysisDestructed;
  });
}

async function mCloneBookmark(
  sourceBookmarkId,
  state = "$",
  title,
  description = ""
) {
  if (!title) throw new Error("Bookmark title is required");

  let sourceBookmarkMeta = await mGetBookmarkMeta(
    sourceBookmarkId,
    state,
    this
  );
  return await mCreateBookmarkFromMeta(
    sourceBookmarkMeta,
    title,
    description,
    this
  );
}

function destructSetAnalysis(setAnalysisRaw) {
  // remove "<" and ">" from the start and the end of the string
  setAnalysisRaw = /\<(.*?)\>/g.exec(setAnalysisRaw)[1];

  // split by "}," but keeping the separator in the result string
  let regexSplit = /(?<=\},)/;

  return setAnalysisRaw.split(regexSplit).map((s) => {
    // remove the "," character from the end (if exists)
    s = s.replace(/,\s*$/, "");

    // get the value between { and }
    let regexValues = /\{(.*?)\}/;
    let valueRaw = `${regexValues.exec(s)[1]}`;

    let type;
    let values;

    // option 1 (general case): if the value is expression (starts with `"` and ends with double quote)
    let regexExpression = /\"(.*?)\"/;
    // option 2: if the value is expression (starts with `"=` and ends with double quote)
    let regexExpression1 = /\"=(.*?)\"/;

    // if the value is expression
    if (regexExpression.test(valueRaw)) {
      type = "expression";
      //if starts with `"=` add "=" after the regex
      // else keep it as it is
      if (regexExpression1.test(valueRaw)) {
        values = `=${regexExpression1.exec(valueRaw)[1]}`;
      } else {
        values = `${regexExpression.exec(valueRaw)[1]}`;
      }
    }

    // if the value is list of values
    if (!regexExpression.test(valueRaw)) {
      type = "list";

      let temp = valueRaw.replace(/','/g, '","');
      temp = `["${temp.substr(1, temp.length - 2)}"]`;
      let rawValues = JSON.parse(temp);

      // determine the value based on the type - string or number
      // fields are different based on the value type
      values = rawValues.map((v) => {
        if (typeof v == "number")
          return {
            qIsNumeric: true,
            qNumber: v,
          };

        if (typeof v == "string")
          return {
            qIsNumeric: false,
            qText: v,
          };
      });
    }

    // extract the field from the expression
    // first string before ={
    let regexField = /(.*?)\={/;
    let field = regexField.exec(s)[1];

    return {
      field,
      values,
      type,
    };
  });
}

async function selectListValues(qApp, s) {
  let qField = await qApp.getField(s.field);
  return await qField.selectValues(s.values);
}

async function selectExpressionValues(qApp, s) {
  let listObjectDef = {
    qInfo: {
      qType: "bookmark-creation-temp",
    },
    qListObjectDef: {
      qDef: {
        qFieldDefs: [s.field],
      },
    },
  };

  let listObject = await qApp.createSessionObject(listObjectDef);

  let search = await listObject.searchListObjectFor(
    "/qListObjectDef",
    s.values
  );

  let makeSelection = await listObject.acceptListObjectSearch(
    "/qListObjectDef",
    false
  );

  await qApp.destroySessionObject(listObject.id);

  return typeof makeSelection === "object" &&
    Object.keys(makeSelection).length === 0
    ? true
    : false;
}

module.exports = {
  mGetBookmarkMeta,
  mGetBookmarksMeta,
  mCreateBookmarkFromMeta,
  mCloneBookmark,
  mGetBookmarkValues,
};
