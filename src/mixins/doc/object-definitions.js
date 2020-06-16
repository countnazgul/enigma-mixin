const sessionList = {
    "qInfo": {
        "qId": "",
        "qType": "SessionLists"
    },
    "qSelectionObjectDef": {}
}

const variableList = {
    "qInfo": {
        "qType": "VariableList"
    },
    "qVariableListDef": {
        "qType": "variable"
    }
}

const listBox = {
    "qInfo": {
        "qId": "",
        "qType": "Combo"
    },
    "field": {
        "qListObjectDef": {
            "qStateName": "$",
            "qDef": {
                "qFieldDefs": [],
                "qSortCriterias": [{
                    "qSortByState": 1,
                    "qExpression": {}
                }]
            },
            "qInitialDataFetch": [{
                "qTop": 0,
                "qLeft": 0,
                "qHeight": 100,
                "qWidth": 1
            }]
        }
    }
}

module.exports = {
    sessionList,
    variableList,
    listBox
}