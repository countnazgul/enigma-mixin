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
    await app.getSetAnalysis(state, bookmarkId),
  ]);

  let setAnalysisDestructed = destructSetAnalysis(setAnalysisRaw);

  return {
    properties,
    layout,
    setAnalysisRaw,
    setAnalysisDestructed,
  };
}

async function mCreateBookmarkFromMeta(bookmarkMeta, title, description = "") {
  if (!title) throw new Error("Bookmark title is required");

  await this.clearAll({ qLockedAlso: true });

  let makeSelections = await Promise.all(
    bookmarkMeta.setAnalysisDestructed.map(async (s) => {
      if (s.type == "list") return await selectListValues(this, s);

      if (s.type == "expression") return await selectExpressionValues(this, s);
    })
  );

  let newBookmark = await this.createBookmark({
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

function destructSetAnalysis(setAnalysisRaw) {
  // remove "<" and ">" from the start and the end of the string
  setAnalysisRaw = /\<(.*?)\>/g.exec(setAnalysisRaw)[1];

  // split by "}," but keeping the separator in the result string
  let regexSplit = /(?<=\},)/;

  return setAnalysisRaw.split(regexSplit).map((s) => {
    // remove the "," character from the end (if exists)
    s = s.replace(/,\s*$/, "");

    let regexValues = /\{(.*?)\}/;
    let valueRaw = `${regexValues.exec(s)[1]}`;

    let type;
    let values;

    // if the value is expression - starts with `"=` and ends with double quote
    let regexExpression = /\"=(.*?)\"/;

    if (regexExpression.test(valueRaw)) {
      type = "expression";
      values = `=${regexExpression.exec(valueRaw)[1]}`;
    } else {
      type = "list";
      let rawValues = JSON.parse(`[${valueRaw.replace(/'/g, '"')}]`);

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
  mGetBookmarkValues,
};
