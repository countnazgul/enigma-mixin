import { IMBookmarkMeta, ISetAnalysisDestructed } from "../../index";

export async function mGetBookmarksMeta(
  state?: string
): Promise<IMBookmarkMeta[]> {
  state = state ? state : "$";

  const _this: EngineAPI.IApp = this;

  const listObj: EngineAPI.IGenericBookmarkListProperties = {
    qInfo: {
      qId: "BookmarkList",
      qType: "BookmarkList",
    },
    qBookmarkListDef: {
      qType: "bookmark",
      qData: {
        // dynamic data stored by the Qlik Sense client
        title: "/qMetaDef/title",
        description: "/qMetaDef/description",
        sheetId: "/sheetId",
        selectionFields: "/selectionFields",
        creationDate: "/creationDate",
      },
    },
  };

  const sessionObject = await _this.createSessionObject(listObj);
  const sessionObjectLayout = await sessionObject.getLayout();
  const bookmarks = sessionObjectLayout.qBookmarkList.qItems;

  await this.destroySessionObject(sessionObject.id);

  return await Promise.all(
    bookmarks.map(async (bookmark) => {
      return await getBookmarkMeta(bookmark.qInfo.qId, state, _this);
    })
  );
}

export async function mGetBookmarkMeta(
  bookmarkId: string,
  state?: string
): Promise<IMBookmarkMeta> {
  if (!bookmarkId)
    throw new Error(`mGetBookmarkMeta: "bookmarkId" parameter is required`);

  state = state ? state : "$";

  const _this: EngineAPI.IApp = this;

  return await getBookmarkMeta(bookmarkId, state, _this);
}

export async function mCreateBookmarkFromMeta(
  bookmarkMeta: IMBookmarkMeta,
  title: string,
  description?: string
): Promise<string> {
  if (!title)
    throw new Error(`mCreateBookmarkFromMeta: "title" parameter is required`);

  const _this: EngineAPI.IApp = this;

  return await createBookmarkFromMeta(
    _this,
    bookmarkMeta,
    title,
    description ? description : ""
  );
}

export async function mGetBookmarkValues(bookmarkId: string, state?: string) {
  if (!bookmarkId)
    throw new Error(`mGetBookmarkValues: "bookmarkId" parameter is required`);

  state = state ? state : "$";
  const _this: EngineAPI.IApp = this;

  return await getBookmarkMeta(bookmarkId, state, _this).then((b) => {
    return b.setAnalysisDestructed;
  });
}

export async function mCloneBookmark(
  sourceBookmarkId: string,
  title: string,
  description?: string,
  state?: string
): Promise<string> {
  if (!sourceBookmarkId)
    throw new Error(`mCloneBookmark: "sourceBookmarkId" parameter is required`);
  if (!title) throw new Error(`mCloneBookmark: "title" parameter is required`);

  state = state ? state : "$";
  const _this: EngineAPI.IApp = this;

  const sourceBookmarkMeta = await getBookmarkMeta(
    sourceBookmarkId,
    state,
    _this
  );

  return await createBookmarkFromMeta(
    _this,
    sourceBookmarkMeta,
    title,
    description ? description : ""
  );
}

export async function getBookmarkMeta(
  bookmarkId: string,
  state: string,
  qDoc: EngineAPI.IApp
) {
  const bookmark = await qDoc.getBookmark(bookmarkId);

  const [properties, layout, setAnalysisRaw] = await Promise.all([
    await bookmark.getProperties(),
    await bookmark.getLayout(),
    await qDoc.getSetAnalysis(state, bookmarkId),
  ]);

  const setAnalysisDestructed = destructSetAnalysis(setAnalysisRaw);

  return {
    properties,
    layout,
    setAnalysisRaw,
    setAnalysisDestructed,
  };
}

async function createBookmarkFromMeta(
  qApp: EngineAPI.IApp,
  bookmarkMeta: IMBookmarkMeta,
  title: string,
  description?: string
) {
  await qApp.clearAll(true);

  const makeSelections = await Promise.all(
    bookmarkMeta.setAnalysisDestructed.map(async (s) => {
      if (s.type == "list") return await selectListValues(qApp, s);
      if (s.type == "expression") return await selectExpressionValues(qApp, s);
    })
  );

  if (!makeSelections.every((v) => v === true)) {
    throw new Error(`Failed to make selection`);
  }

  const bookmarkProps: EngineAPI.IGenericBookmarkProperties = {
    qInfo: {
      qType: "bookmark",
    },
    qMetaDef: {
      title: title,
      description: description,
    },
  };

  const newBookmark = await qApp.createBookmark(bookmarkProps);
  const newBookmarkProps = await newBookmark.getProperties();

  return newBookmarkProps.qInfo.qId;
}

function destructSetAnalysis(setAnalysisRaw: string): {
  field: string;
  values: string | EngineAPI.IFieldValue;
  type: string;
}[] {
  // remove "<" and ">" from the start and the end of the string
  setAnalysisRaw = /\<(.*?)\>/g.exec(setAnalysisRaw)[1];

  // split by "}," but keeping the separator in the result string
  const regexSplit = /(?<=\},)/;

  return setAnalysisRaw.split(regexSplit).map((s) => {
    // remove the "," character from the end (if exists)
    s = s.replace(/,\s*$/, "");

    // get the value between { and }
    const regexValues = /\{(.*?)\}/;
    const valueRaw = `${regexValues.exec(s)[1]}`;

    let type: string = "";
    let values: string | EngineAPI.IFieldValue;

    // option 1 (general case): if the value is expression (starts with `"` and ends with double quote)
    const regexExpression = /\"(.*?)\"/;
    // option 2: if the value is expression (starts with `"=` and ends with double quote)
    const regexExpression1 = /\"=(.*?)\"/;

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
      temp = `["${temp.substring(1, temp.length - 1)}"]`;
      let rawValues = JSON.parse(temp);

      // determine the value based on the type - string or number
      // fields are different based on the value type
      values = rawValues.map((v: any) => {
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

async function selectListValues(
  qApp: EngineAPI.IApp,
  s: ISetAnalysisDestructed
): Promise<boolean> {
  const qField = await qApp.getField(s.field);
  return await qField.selectValues(s.values as EngineAPI.IFieldValue[]);
}

async function selectExpressionValues(qApp: EngineAPI.IApp, s) {
  const listObjectDef = {
    qInfo: {
      qType: "bookmark-creation-temp",
    },
    qListObjectDef: {
      qDef: {
        qFieldDefs: [s.field],
      },
    },
  };

  const listObject = await qApp.createSessionObject(listObjectDef);

  const search = await listObject.searchListObjectFor(
    "/qListObjectDef",
    s.values
  );

  const makeSelection = await listObject.acceptListObjectSearch(
    "/qListObjectDef",
    false
  );

  await qApp.destroySessionObject(listObject.id);

  return typeof makeSelection === "object" &&
    Object.keys(makeSelection).length === 0
    ? true
    : false;
}
