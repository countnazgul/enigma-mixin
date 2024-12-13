export async function mGetAllDataMatrix(): Promise<EngineAPI.INxCellRows[]> {
  const _this: EngineAPI.IGenericObject = this;

  const layout = (await _this.getLayout()) as EngineAPI.IGenericHyperCubeLayout;
  const dataPageSize = Math.floor(1000 / layout.qHyperCube.qSize.qcx);
  const numberOfPages = Math.ceil(layout.qHyperCube.qSize.qcy / dataPageSize);

  const data = await extractData(
    _this,
    numberOfPages,
    dataPageSize,
    layout.qHyperCube.qSize.qcx
  );

  return data;
}

export async function mGetAllData(): Promise<any[]> {
  const _this: EngineAPI.IGenericObject = this;

  const layout = (await _this.getLayout()) as EngineAPI.IGenericHyperCubeLayout;
  const dataPageSize = Math.floor(10000 / layout.qHyperCube.qSize.qcx);
  const numberOfPages = Math.ceil(layout.qHyperCube.qSize.qcy / dataPageSize);

  const data = await extractData(
    _this,
    numberOfPages,
    dataPageSize,
    layout.qHyperCube.qSize.qcx
  ).then((data) => {
    return data.map((row) => {
      const d = [];
      row.map((cell) => {
        //@ts-ignore
        if (cell.qNum != "NaN" || cell.qNum == undefined) {
          d.push(cell.qNum);
        } else {
          d.push(cell.qText);
        }
      });
      return d;
    });
  });

  return data;
}

async function extractData(
  genericObject: EngineAPI.IGenericObject,
  numberOfPages: number,
  dataPageSize: number,
  columns: number
): Promise<EngineAPI.INxCellRows[]> {
  let data = [];

  for (let i = 0; i < numberOfPages + 1; i++) {
    const page: EngineAPI.INxPage = {
      qTop: dataPageSize * i,
      qWidth: columns,
      qLeft: 0,
      qHeight: dataPageSize,
    };

    const pageData = await genericObject
      .getHyperCubeData("/qHyperCubeDef", [page])
      .then((data) => data[0].qMatrix);

    data = [...data, ...pageData];
  }

  return data;
}
