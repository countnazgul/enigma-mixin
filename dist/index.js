'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function mVariableGetAll(showConfig, showReserved) {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        const objProp = {
            qInfo: {
                qType: "VariableList",
            },
            qVariableListDef: {
                qData: {},
                qShowConfig: false,
                qShowReserved: false,
                qType: "variable",
            },
        };
        if (showConfig)
            objProp.qShowConfig = showConfig;
        if (showReserved)
            objProp.qShowReserved = showReserved;
        const sessionObj = yield _this.createSessionObject(objProp);
        const layout = (yield sessionObj.getLayout());
        yield _this.destroySessionObject(sessionObj.id);
        return layout.qVariableList
            .qItems;
    });
}
function mVariableUpdateById(id, name, definition, comment) {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        if (!id)
            throw new Error(`mVariableUpdateById: "id" parameter is required`);
        const variable = yield _this.getVariableById(id);
        const variableProps = yield variable.getProperties();
        if (name)
            variableProps.qName = name;
        if (definition)
            variableProps.qDefinition = definition;
        if (comment)
            variableProps.qComment = comment;
        yield variable.setProperties(variableProps);
        const newProps = yield variable.getProperties();
        return newProps;
    });
}
function mVariableUpdateByName(name, newName, definition, comment) {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        if (!name)
            throw new Error(`mVariableUpdateByName: "name" parameter is required`);
        const variable = yield _this.getVariableByName(name);
        const variableProps = yield variable.getProperties();
        if (newName)
            variableProps.qName = newName;
        if (definition)
            variableProps.qDefinition = definition;
        if (comment)
            variableProps.qComment = comment;
        yield variable.setProperties(variableProps);
        const newProps = yield variable.getProperties();
        return newProps;
    });
}
function mVariableCreate(name, definition, comment) {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        if (!name)
            throw new Error(`mVariableCreate: "name" parameter is required`);
        const varProps = {
            qInfo: {
                qType: "variable",
            },
            qName: name,
            qDefinition: definition ? definition : "",
            qComment: comment ? comment : "",
            qIncludeInBookmark: false,
        };
        const created = yield _this.createVariableEx(varProps);
        const variableInst = yield _this.getVariableById(created.id);
        const props = yield variableInst.getProperties();
        return props;
    });
}

function mGetTablesAndFields() {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        const tables = yield _this.getTablesAndKeys({}, {}, 0, true, false);
        return tables.qtr
            .map(function (t) {
            return t.qFields.map(function (f) {
                return { table: t.qName, field: f.qName };
            });
        })
            .flat();
    });
}
function mGetTables() {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        const qTables = yield _this.getTablesAndKeys({}, {}, 0, true, false);
        return qTables.qtr.map((t) => t.qName);
    });
}
function mGetFields() {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        const qTables = yield _this.getTablesAndKeys({}, {}, 0, true, false);
        return qTables.qtr
            .map(function (t) {
            return t.qFields.map(function (f) {
                return f.qName;
            });
        })
            .flat();
    });
}
// TODO: option to specify if full data to be extracted (loop though all data pages)
function mCreateSessionListbox(fieldName, state, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        const lbDef = {
            qInfo: {
                qId: "",
                qType: type ? type : "session-listbox",
            },
            field: {
                qListObjectDef: {
                    qStateName: state ? state : "$",
                    qDef: {
                        qFieldDefs: [fieldName],
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
                            qHeight: 10000,
                            qWidth: 1,
                        },
                    ],
                },
            },
        };
        const obj = yield _this.createSessionObject(lbDef);
        const [props, layout] = yield Promise.all([
            yield obj.getProperties(),
            yield obj.getLayout(),
        ]);
        return {
            obj,
            layout,
            props,
        };
    });
}

function iGetSelectionsNative(qDoc) {
    return __awaiter(this, void 0, void 0, function* () {
        const lbDef = {
            qInfo: {
                qId: "",
                qType: "CurrentSelection",
            },
            qSelectionObjectDef: {},
        };
        const sessionObj = yield qDoc.createSessionObject(lbDef);
        const selections = yield sessionObj.getLayout();
        yield qDoc.destroySessionObject(sessionObj.id);
        return selections;
    });
}
function mSelectionsAll() {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        const selections = yield iGetSelectionsNative(_this);
        return selections.qSelectionObject;
    });
}
function mSelectionsFields() {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        const selections = yield iGetSelectionsNative(_this);
        const fieldsSelected = selections.qSelectionObject.qSelections.map(function (s) {
            return s.qField;
        });
        return fieldsSelected;
    });
}
function mSelectionsSimple() {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        const selections = yield iGetSelectionsNative(_this);
        return selections.qSelectionObject.qSelections.map(function (s) {
            const values = s.qSelectedFieldSelectionInfo.map(function (f) {
                return f.qName;
            });
            return { field: s.qField, values };
        });
    });
}
function mSelectionsSimpleGrouped() {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        const selections = yield iGetSelectionsNative(_this);
        return selections.qSelectionObject.qSelections
            .map(function (s) {
            return s.qSelectedFieldSelectionInfo.map(function (f) {
                return { field: s.qField, value: f.qName };
            });
        })
            .flat();
    });
}
function mSelectInField(fieldName, values, toggle, state) {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        if (!fieldName)
            throw new Error(`mSelectInField: "fieldName" parameter is required`);
        if (!values)
            throw new Error(`mSelectInField: "values" parameter is required`);
        const lbDef = {
            qInfo: {
                qId: "",
                qType: "session-listbox",
            },
            field: {
                qListObjectDef: {
                    qStateName: state ? state : "$",
                    qDef: {
                        qFieldDefs: [fieldName],
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
                            qHeight: 10000,
                            qWidth: 1,
                        },
                    ],
                },
            },
        };
        const sessionObj = yield _this.createSessionObject(lbDef);
        const layout = yield sessionObj.getLayout();
        const index = layout.field.qListObject.qDataPages[0].qMatrix
            .filter(function (m) {
            return values.indexOf(m[0].qText) > -1;
        })
            .map(function (e) {
            return e[0].qElemNumber;
        });
        const selection = yield sessionObj.selectListObjectValues("/field/qListObjectDef", index, toggle ? toggle : false);
        yield _this.destroySessionObject(sessionObj.id);
        return selection;
    });
}

function mExtensionObjectsAll() {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        const allInfos = yield _this.getAllInfos();
        const props = yield _this.getAppProperties();
        return yield filterOnlyExtensionObjects(this, props, allInfos);
    });
}
function filterOnlyExtensionObjects(qDoc, props, allObjects) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Promise.all(allObjects.map(function (extObj) {
            return __awaiter(this, void 0, void 0, function* () {
                const isReallyExtension = yield realExtensionCheck(qDoc, extObj.qId);
                if (isReallyExtension.isExtension) {
                    return {
                        appId: qDoc.id,
                        appName: props.qTitle,
                        objId: isReallyExtension.qObjProps.qInfo.qId,
                        objType: isReallyExtension.qObjProps.qInfo.qType,
                        extName: isReallyExtension.qObjProps.extensionMeta.name,
                        extVersion: isReallyExtension.qObjProps.version,
                        extVisible: isReallyExtension.qObjProps.extensionMeta.visible,
                        extIsBundle: !isReallyExtension.qObjProps.extensionMeta.isThirdParty,
                        extIsLibrary: isReallyExtension.qObjProps.extensionMeta.isLibraryItem,
                        qProps: isReallyExtension.qObjProps,
                    };
                }
            });
        })).then(function (o) {
            // make sure we filter out all object which are not
            // native object but are not extensions as well
            return o.filter(function (a) {
                return a != undefined;
            });
        });
    });
}
const realExtensionCheck = function (qDoc, objId) {
    return __awaiter(this, void 0, void 0, function* () {
        const nativeObjectTypes = [
            "barchart",
            "boxplot",
            "combochart",
            "distributionplot",
            "gauge",
            "histogram",
            "kpi",
            "linechart",
            "piechart",
            "pivot-table",
            "scatterplot",
            "table",
            "treemap",
            "extension",
            "map",
            "listbox",
            "filterpane",
            "title",
            "paragraph",
        ];
        const qObj = yield qDoc.getObject(objId);
        const qObjProps = yield qObj.getProperties();
        if (!qObjProps.visualization)
            return { isExtension: false };
        const isNative = nativeObjectTypes.indexOf(qObjProps.visualization);
        return {
            qObjProps,
            isExtension: isNative == -1 && qObjProps.extensionMeta ? true : false,
        };
    });
};

function mGetBookmarksMeta(state) {
    return __awaiter(this, void 0, void 0, function* () {
        state = state ? state : "$";
        const _this = this;
        const listObj = {
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
        const sessionObject = yield _this.createSessionObject(listObj);
        const sessionObjectLayout = yield sessionObject.getLayout();
        const bookmarks = sessionObjectLayout.qBookmarkList.qItems;
        yield this.destroySessionObject(sessionObject.id);
        return yield Promise.all(bookmarks.map((bookmark) => __awaiter(this, void 0, void 0, function* () {
            return yield getBookmarkMeta(bookmark.qInfo.qId, state, _this);
        })));
    });
}
function mGetBookmarkMeta(bookmarkId, state) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!bookmarkId)
            throw new Error(`mGetBookmarkMeta: "bookmarkId" parameter is required`);
        state = state ? state : "$";
        const _this = this;
        return yield getBookmarkMeta(bookmarkId, state, _this);
    });
}
function mCreateBookmarkFromMeta(bookmarkMeta, title, description) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!title)
            throw new Error(`mCreateBookmarkFromMeta: "title" parameter is required`);
        const _this = this;
        return yield createBookmarkFromMeta(_this, bookmarkMeta, title, description ? description : "");
    });
}
function mGetBookmarkValues(bookmarkId, state) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!bookmarkId)
            throw new Error(`mGetBookmarkValues: "bookmarkId" parameter is required`);
        state = state ? state : "$";
        const _this = this;
        return yield getBookmarkMeta(bookmarkId, state, _this).then((b) => {
            return b.setAnalysisDestructed;
        });
    });
}
function mCloneBookmark(sourceBookmarkId, title, description, state) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sourceBookmarkId)
            throw new Error(`mCloneBookmark: "sourceBookmarkId" parameter is required`);
        if (!title)
            throw new Error(`mCloneBookmark: "title" parameter is required`);
        state = state ? state : "$";
        const _this = this;
        const sourceBookmarkMeta = yield getBookmarkMeta(sourceBookmarkId, state, _this);
        return yield createBookmarkFromMeta(_this, sourceBookmarkMeta, title, description ? description : "");
    });
}
function getBookmarkMeta(bookmarkId, state, qDoc) {
    return __awaiter(this, void 0, void 0, function* () {
        const bookmark = yield qDoc.getBookmark(bookmarkId);
        const [properties, layout, setAnalysisRaw] = yield Promise.all([
            yield bookmark.getProperties(),
            yield bookmark.getLayout(),
            yield qDoc.getSetAnalysis(state, bookmarkId),
        ]);
        const setAnalysisDestructed = destructSetAnalysis(setAnalysisRaw);
        return {
            properties,
            layout,
            setAnalysisRaw,
            setAnalysisDestructed,
        };
    });
}
function createBookmarkFromMeta(qApp, bookmarkMeta, title, description) {
    return __awaiter(this, void 0, void 0, function* () {
        yield qApp.clearAll(true);
        const makeSelections = yield Promise.all(bookmarkMeta.setAnalysisDestructed.map((s) => __awaiter(this, void 0, void 0, function* () {
            if (s.type == "list")
                return yield selectListValues(qApp, s);
            if (s.type == "expression")
                return yield selectExpressionValues(qApp, s);
        })));
        if (!makeSelections.every((v) => v === true)) {
            throw new Error(`Failed to make selection`);
        }
        const bookmarkProps = {
            qInfo: {
                qType: "bookmark",
            },
            qMetaDef: {
                title: title,
                description: description,
            },
        };
        const newBookmark = yield qApp.createBookmark(bookmarkProps);
        const newBookmarkProps = yield newBookmark.getProperties();
        return newBookmarkProps.qInfo.qId;
    });
}
function destructSetAnalysis(setAnalysisRaw) {
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
        let type = "";
        let values;
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
            }
            else {
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
function selectListValues(qApp, s) {
    return __awaiter(this, void 0, void 0, function* () {
        const qField = yield qApp.getField(s.field);
        return yield qField.selectValues(s.values);
    });
}
function selectExpressionValues(qApp, s) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const listObject = yield qApp.createSessionObject(listObjectDef);
        yield listObject.searchListObjectFor("/qListObjectDef", s.values);
        const makeSelection = yield listObject.acceptListObjectSearch("/qListObjectDef", false);
        yield qApp.destroySessionObject(listObject.id);
        return typeof makeSelection === "object" &&
            Object.keys(makeSelection).length === 0
            ? true
            : false;
    });
}

function mUnbuild(sections) {
    return __awaiter(this, void 0, void 0, function* () {
        const _this = this;
        return yield Promise.all([
            yield unbuildVariables(_this, sections ? sections.includes("variables") : true),
            yield unbuildScript(_this, sections ? sections.includes("script") : true),
            yield unbuildAppProperties(_this, sections ? sections.includes("appProperties") : true),
            yield unbuildConnections(_this, sections ? sections.includes("connections") : true),
            yield unbuildEntities(_this, sections
                ? sections.includes("dimensions") ||
                    sections.includes("objects") ||
                    sections.includes("measures")
                : true, sections),
            yield unbuildBookmarks(_this, sections ? sections.includes("bookmarks") : true),
        ])
            .then((data) => ({
            variables: data[0],
            script: data[1],
            appProperties: data[2],
            connections: data[3],
            dimensions: data[4].dimensions ? data[4].dimensions : [],
            measures: data[4].measures ? data[4].measures : [],
            objects: data[4].objects ? data[4].objects : [],
            bookmarks: data[5],
        }))
            .then((data) => {
            if (!sections)
                return data;
            const sectionsDistinct = new Set(sections);
            return Object.fromEntries(Object.entries(data).filter(([key]) => Array.from(sectionsDistinct).includes(key)));
        });
    });
}
function unbuildVariables(app, unBuild) {
    return __awaiter(this, void 0, void 0, function* () {
        if (unBuild) {
            const objProp = {
                qInfo: {
                    qType: "VariableList",
                },
                qVariableListDef: {
                    qData: {},
                    qType: "variable",
                    qShowReserved: false,
                    qShowConfig: false,
                },
            };
            const sessionObj = yield app.createSessionObject(objProp);
            const sessionObjLayout = yield sessionObj.getLayout();
            yield app.destroySessionObject(sessionObj.id);
            return yield Promise.all(sessionObjLayout.qVariableList.qItems.map((variable) => __awaiter(this, void 0, void 0, function* () {
                const qVariable = yield app.getVariableById(variable.qInfo.qId);
                return yield qVariable.getProperties();
            })));
        }
    });
}
function unbuildScript(app, unBuild) {
    return __awaiter(this, void 0, void 0, function* () {
        if (unBuild) {
            const script = yield app.getScript();
            // return script.replace(/\r\n/g, "");
            return script;
        }
        return "";
    });
}
function unbuildAppProperties(app, unBuild) {
    return __awaiter(this, void 0, void 0, function* () {
        let appProperties = {};
        if (unBuild) {
            appProperties = yield app.getAppProperties();
        }
        return appProperties;
    });
}
function unbuildConnections(app, unBuild) {
    return __awaiter(this, void 0, void 0, function* () {
        if (unBuild) {
            const appConnections = yield app.getConnections();
            return appConnections;
        }
    });
}
function unbuildEntities(app, unBuild, sections) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = {
            dimensions: [],
            measures: [],
            objects: [],
        };
        if (unBuild) {
            // get list of all objects
            const appAllInfos = yield app.getAllInfos();
            return Promise.all(appAllInfos.map(function (item) {
                return __awaiter(this, void 0, void 0, function* () {
                    // try {
                    if (item.qType == "dimension") {
                        if (!sections || sections.includes("dimensions")) {
                            const dim = yield app.getDimension(item.qId);
                            const dimProp = yield dim.getProperties();
                            data.dimensions.push(dimProp);
                        }
                    }
                    if (item.qType == "measure") {
                        if (!sections || sections.includes("measures")) {
                            const measure = yield app.getMeasure(item.qId);
                            const measureProp = yield measure.getProperties();
                            data.measures.push(measureProp);
                        }
                    }
                    if (item.qType != "dimension" &&
                        item.qType != "measure" &&
                        item.qType.indexOf("snapshot") == -1 &&
                        item.qType != "bookmark" &&
                        item.qType != "appprops") {
                        if (!sections || sections.includes("objects")) {
                            const o = yield processObject(item, app);
                            data.objects.push(o);
                        }
                    }
                });
            })).then(() => data);
        }
        return data;
    });
}
function unbuildBookmarks(app, unBuild) {
    return __awaiter(this, void 0, void 0, function* () {
        if (unBuild) {
            const listObj = {
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
            const sessionObject = yield app.createSessionObject(listObj);
            const sessionObjectLayout = yield sessionObject.getLayout();
            const bookmarks = sessionObjectLayout.qBookmarkList.qItems;
            yield app.destroySessionObject(sessionObject.id);
            return yield Promise.all(bookmarks.map((bookmark) => __awaiter(this, void 0, void 0, function* () {
                return yield getBookmarkMeta(bookmark.qInfo.qId, "$", app);
            })));
        }
    });
}
function processObject(item, app) {
    return __awaiter(this, void 0, void 0, function* () {
        const obj = yield app.getObject(item.qId);
        // embeddedsnapshot, snapshot, hiddenbookmark, story --> need to be handled differently
        const parent = yield obj
            .getParent()
            .then(() => true)
            .catch(() => false);
        const children = yield obj.getChildInfos();
        // parent-less objects - masterobject, sheet, appprops, LoadModel
        if (!parent && children.length > 0)
            return yield obj.getFullPropertyTree();
        const prop = yield obj.getProperties();
        return prop;
    });
}

// TODO: ...
function mBuild(arg) {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.all([
            yield processMeasures(arg.measures, this),
            yield processDimensions(arg.dimensions, this),
            yield processScript(arg.script, this),
            yield processAppProperties(arg.appProperties, this),
            yield processConnections(arg.connections, this),
            yield processVariables(arg.variables, this),
            yield processObjects(arg.objects, this),
        ])
            .then(function (d) {
            return {
                measures: d[0],
                dimensions: d[1],
                script: d[2],
                appProperties: d[3],
                connections: d[4],
                variables: d[5],
                objects: d[6],
            };
        })
            .then((data) => {
            const notNullKeys = Object.keys(data).filter((k) => {
                return data[k] != undefined;
            });
            return Object.fromEntries(Object.entries(data).filter(([key]) => Array.from(notNullKeys).includes(key)));
        });
    });
}
function processMeasures(measures, app) {
    return __awaiter(this, void 0, void 0, function* () {
        if (measures) {
            return Promise.all(measures.map(function (measure) {
                return __awaiter(this, void 0, void 0, function* () {
                    let obj = {};
                    // the measure do not exists and need to be created
                    try {
                        obj = yield app.getMeasure(measure.qInfo.qId);
                    }
                    catch (e) { }
                    if (!obj.id) {
                        yield app.createMeasure(measure);
                        return { qId: measure.qInfo.qId, status: "Created" };
                    }
                    // the measure exists and need to be updated
                    yield obj.setProperties(measure);
                    return { qId: measure.qInfo.qId, status: "Updated" };
                });
            }));
        }
    });
}
function processDimensions(dimensions, app) {
    return __awaiter(this, void 0, void 0, function* () {
        if (dimensions) {
            return Promise.all(dimensions.map(function (dimension) {
                return __awaiter(this, void 0, void 0, function* () {
                    let obj = {};
                    try {
                        obj = yield app.getDimension(dimension.qInfo.qId);
                    }
                    catch (e) { }
                    // the dimension do not exists and need to be created
                    if (!obj.id) {
                        yield app.createDimension(dimension);
                        return { qId: dimension.qInfo.qId, status: "Created" };
                    }
                    // the dimension exists and need to be updated
                    yield obj.setProperties(dimension);
                    return { qId: dimension.qInfo.qId, status: "Updated" };
                });
            }));
        }
    });
}
function processScript(script, app) {
    return __awaiter(this, void 0, void 0, function* () {
        if (script) {
            yield app.setScript(script);
            return { status: "Set" };
        }
    });
}
function processAppProperties(appProperties, app) {
    return __awaiter(this, void 0, void 0, function* () {
        if (appProperties) {
            yield app.setAppProperties(appProperties);
            return { status: "Set" };
        }
    });
}
function processConnections(connections, app) {
    return __awaiter(this, void 0, void 0, function* () {
        if (connections) {
            const appConnections = yield app.getConnections();
            return Promise.all(connections.map(function (connection) {
                return __awaiter(this, void 0, void 0, function* () {
                    const conn = appConnections.find((o) => o.qName === connection.qName);
                    if (!conn) {
                        yield app.createConnection(connection);
                        return { qId: connection.qName, status: "Created" };
                    }
                    yield app.modifyConnection(conn.qId, connection, true);
                    return { qId: connection.qName, status: "Updated" };
                });
            }));
        }
    });
}
function processVariables(variables, app) {
    return __awaiter(this, void 0, void 0, function* () {
        if (variables) {
            return Promise.all(variables.map(function (variable) {
                return __awaiter(this, void 0, void 0, function* () {
                    let qVar;
                    try {
                        qVar = yield app.getVariableByName(variable.qName);
                    }
                    catch (e) { }
                    if (!qVar || !qVar.id) {
                        yield app.createVariableEx(variable);
                        return { qId: variable.qName, status: "Created" };
                    }
                    yield qVar.setProperties(variable);
                    return { qId: variable.qName, status: "Updated" };
                });
            }));
        }
    });
}
function processObjects(objects, app) {
    return __awaiter(this, void 0, void 0, function* () {
        if (objects) {
            return Promise.all(objects.map(function (object) {
                return __awaiter(this, void 0, void 0, function* () {
                    let objId, objType;
                    let isGenericObject = false;
                    //if the object is GenericObject - the id and the type are in a slightly different path
                    if (!object.qInfo) {
                        isGenericObject = true;
                        objId = object.qProperty.qInfo.qId;
                        objType = object.qProperty.qInfo.qType;
                    }
                    else {
                        objId = object.qInfo.qId;
                        objType = object.qInfo.qType;
                    }
                    let obj;
                    try {
                        obj = yield app.getObject(objId);
                    }
                    catch (e) { }
                    if (obj && obj.id) {
                        // if its GenericObject we have to set the the props using setFullPropertyTree
                        if (isGenericObject) {
                            obj.setFullPropertyTree(object);
                            return { qId: objId, status: "Updated" };
                        }
                        // if not GenericObject then use the "usual" setProperties
                        if (!isGenericObject) {
                            yield obj.setProperties(object);
                            return { qId: objId, status: "Updated" };
                        }
                    }
                    // same rules are applied when we have to create the object
                    if (!obj || !obj.id) {
                        if (isGenericObject) {
                            const o = yield app.createObject({
                                qInfo: {
                                    qId: `${objId}`,
                                    qType: objType,
                                },
                            });
                            yield o.setFullPropertyTree(object);
                            return { qId: objId, status: "Created" };
                        }
                        if (!isGenericObject) {
                            yield app.createObject(object);
                            return { qId: objId, status: "Created" };
                        }
                    }
                });
            }));
        }
    });
}

const docMixin = [
    {
        types: ["Doc"],
        init(args) { },
        extend: {
            mSelectInField,
            mSelectionsAll,
            mSelectionsFields,
            mSelectionsSimple,
            mSelectionsSimpleGrouped,
            mVariableCreate,
            mVariableGetAll,
            mVariableUpdateById,
            mVariableUpdateByName,
            mCreateSessionListbox,
            mGetFields,
            mGetTables,
            mGetTablesAndFields,
            mExtensionObjectsAll,
            mBuild,
            mUnbuild,
            mCloneBookmark,
            mCreateBookmarkFromMeta,
            mGetBookmarkMeta,
            mGetBookmarkValues,
            mGetBookmarksMeta,
        },
    },
];

exports.docMixin = docMixin;
//# sourceMappingURL=index.js.map
