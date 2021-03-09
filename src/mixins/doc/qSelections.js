const objectDefinitions = require("./object-definitions.js");
const { handlePromise } = require("../../lib/helpers");

async function iGetSelectionsNative(qDoc) {
  let [sessionObj, sessionObjError] = await handlePromise(
    qDoc.createSessionObject(objectDefinitions.sessionList)
  );
  if (sessionObjError) throw new Error(sessionObjError.message);

  let [selections, selectionsError] = await handlePromise(
    sessionObj.getLayout()
  );
  if (selectionsError) throw new Error(selectionsError.message);

  let [destroy, destroyError] = await handlePromise(
    qDoc.destroySessionObject(sessionObj.id)
  );
  if (destroyError) throw new Error(destroyError.message);

  let selectedValues = await Promise.all(
    selections.qSelectionObject.qSelections.map(async (s) => {
      return await getFieldSelections(qDoc, s);
    })
  );

  return { selections, selectedValues };
}

async function mSelectionsAll() {
  let [selections, error] = await handlePromise(iGetSelectionsNative(this));
  if (error) throw new Error(error.message);

  return {
    selections: selections.selections.qSelectionObject,
    selectedValues: selections.selectedValues,
  };
}

async function mSelectionsFields() {
  let [selections, error] = await handlePromise(iGetSelectionsNative(this));
  if (error) throw new Error(error.message);

  let fieldsSelected = selections.selections.qSelectionObject.qSelections.map(
    function (s) {
      return s.qField;
    }
  );

  return fieldsSelected;
}

async function mSelectionsSimple(groupByField = false) {
  let [selections, error] = await handlePromise(iGetSelectionsNative(this));
  if (error) throw new Error(error.message);

  if (!groupByField)
    return selections.selections.qSelectionObject.qSelections
      .map(function (s) {
        return s.qSelectedFieldSelectionInfo.map(function (f) {
          return { field: s.qField, value: f.qName };
        });
      })
      .flat();

  return selections.selections.qSelectionObject.qSelections.map(function (s) {
    let values = s.qSelectedFieldSelectionInfo.map(function (f) {
      return f.qName;
    });

    return { field: s.qField, values };
  });
}

async function mSelectInField(fieldName, values, toggle = false) {
  let lbDef = objectDefinitions.listBox;
  lbDef.field.qListObjectDef.qDef.qFieldDefs = [fieldName];
  lbDef.qInfo.qType = "session-listbox";

  let [sessionObj, sessionObjErr] = await handlePromise(
    this.createSessionObject(lbDef)
  );
  if (sessionObjErr) throw new Error(sessionObjErr.message);

  let [layout, layoutError] = await handlePromise(sessionObj.getLayout());
  if (layoutError) throw new Error(layoutError.message);

  let index = layout.field.qListObject.qDataPages[0].qMatrix
    .filter(function (m) {
      return values.indexOf(m[0].qText) > -1;
    })
    .map(function (e) {
      return e[0].qElemNumber;
    });

  let [selection, selectionError] = await handlePromise(
    sessionObj.selectListObjectValues("/field/qListObjectDef", index, toggle)
  );
  if (selectionError) throw new Error(selectionError.message);

  let [destroy, destroyError] = await handlePromise(
    this.destroySessionObject(sessionObj.id)
  );
  if (destroyError) throw new Error(destroyError.message);

  return selection;
}

async function getFieldSelections(qDoc, qSelection) {
  // total selected values according to Qlik
  let totalSelected = qSelection.qStateCounts.qSelected;

  // create session listbox for the field to get all the data
  let lbDef = {
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
            qHeight: 1000,
            qWidth: 1,
          },
        ],
      },
    },
  };
  lbDef.field.qListObjectDef.qDef.qFieldDefs = [`[${qSelection.qField}]`];
  lbDef.qInfo.qType = "session-listbox";
  let lb = await qDoc.createSessionObject(lbDef);
  let lbLayout = await lb.getLayout();

  // determine the length of the data in the field
  let totalDataPages = Math.ceil(
    qSelection.qTotal / lbDef.field.qListObjectDef.qInitialDataFetch[0].qHeight
  );

  // 1. if all the field values are fitting in one data page
  //    just filter for selected values (qState="S")
  if (totalDataPages == 1) {
    await qDoc.destroySessionObject(lb.id);
    return {
      qField: qSelection.qField,
      qValues: filterSelectedValues(
        lbLayout.field.qListObject.qDataPages[0].qMatrix
      ),
    };
  }

  // 2. if field values are paged, first check if all selected values are in the first data page
  //    and if yes -  filter the data page for the selected values
  let tempSelected = filterSelectedValues(
    lbLayout.field.qListObject.qDataPages[0].qMatrix
  );

  if (tempSelected.length == totalSelected) {
    await qDoc.destroySessionObject(lb.id);
    return {
      qField: qSelection.qField,
      qValues: tempSelected,
    };
  }

  // 3. a lot of selected values in a field with a lot of values.
  //    Loop through all listbox values
  let selectedValues = [...tempSelected];
  let qTop = lbDef.field.qListObjectDef.qInitialDataFetch[0].qHeight;

  for (let i = 1; i < totalDataPages; i++) {
    let dataPage = await lb.getListObjectData("/field/qListObjectDef", [
      {
        qTop: qTop,
        qLeft: 0,
        qHeight: lbDef.field.qListObjectDef.qInitialDataFetch[0].qHeight,
        qWidth: 1,
      },
    ]);

    qTop += lbDef.field.qListObjectDef.qInitialDataFetch[0].qHeight;

    let b = filterSelectedValues(dataPage[0].qMatrix);

    selectedValues = [...selectedValues, ...b];

    if (selectedValues.length == totalSelected) break;
  }

  await qDoc.destroySessionObject(lb.id);
  return {
    qField: qSelection.qField,
    qValues: selectedValues,
  };
}

function filterSelectedValues(qMatrix) {
  return qMatrix
    .filter((v) => {
      return v[0].qState == "S";
    })
    .map((v) => {
      return v[0];
    });
}

module.exports = {
  mSelectionsAll,
  mSelectionsFields,
  mSelectionsSimple,
  mSelectInField,
};
