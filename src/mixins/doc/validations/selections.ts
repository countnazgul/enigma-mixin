import { array, boolean, number, string } from "banditypes";

export function validateSelectInFieldBySearch(args: IArguments) {
  try {
    string()(args[0]);
  } catch (e) {
    throw new Error(
      `mSelectInField: "fieldName" parameter is required and it must be a string`
    );
  }

  try {
    string()(args[1]);
  } catch (e) {
    throw new Error(
      `mSelectInField: "values" parameter is required and it must be a string`
    );
  }

  // set "false" as default value for selection toggle
  const definedToggle = boolean().or(() => false);
  const defaultedToggle = definedToggle(args[2]);

  // set "$" as default state is no state or wrong value type is provided
  const definedState = string().or(() => "$");
  const defaultedState = definedState(args[3]);

  return { defaultedState, defaultedToggle };
}

export function validateSelectInField(args: IArguments) {
  try {
    string()(args[0]);
  } catch (e) {
    throw new Error(
      `mSelectInField: "fieldName" parameter is required and it must be a string`
    );
  }

  try {
    array(string().or(number()))(args[1]);
  } catch (e) {
    throw new Error(
      `mSelectInField: "values" parameter is required and it must be an array of strings and/or numbers`
    );
  }

  // set "false" as default value for selection toggle
  const definedToggle = boolean().or(() => false);
  const defaultedToggle = definedToggle(args[2]);

  // set "$" as default state is no state or wrong value type is provided
  const definedState = string().or(() => "$");
  const defaultedState = definedState(args[3]);

  return { defaultedState, defaultedToggle };
}
