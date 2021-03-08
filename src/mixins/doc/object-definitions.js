const sessionList = {
  qInfo: {
    qId: "",
    qType: "SessionLists",
  },
  qSelectionObjectDef: {},
};

const variableList = {
  qInfo: {
    qType: "VariableList",
  },
  qVariableListDef: {
    qType: "variable",
  },
};

const listBox = {
  qInfo: {
    qId: "",
    qType: "",
  },
  field: {
    qListObjectDef: {
      qStateName: "$",
      qDef: {
        qFieldDefs: [],
        qSortCriterias: [
          {
            qSortByState: 1,
            qExpression: {},
          },
        ],
      },
      qInitialDataFetch: [
        {
          qTop: 0,
          qLeft: 0,
          qHeight: 10,
          qWidth: 1,
        },
      ],
    },
  },
};

const bookmarkList = {
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

module.exports = {
  sessionList,
  variableList,
  listBox,
  bookmarkList,
};
