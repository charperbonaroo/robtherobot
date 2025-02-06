export function classNames(...args: ClassNameParam[]): string|undefined {
  const set = new Set<string>();
  for (const arg of args)
    reduce(arg, set);

  return set.size > 0 ? Array.from(set).join(" ") : undefined;
}

function reduce(param: ClassNameParam, set: Set<string>) {
  if (typeof param === "undefined" || param === null || param === false) {
    return;
  } else if (param instanceof Array) {
    for (const arg of param)
      reduce(arg, set);
  } else if (typeof param === "object") {
    for (const key in param)
      if (Object.hasOwn(param, key) && param[key])
        reduce(key, set);
  } else if (typeof param === "string") {
    for (const arg of param.split(/ /g))
      if (arg.length > 0)
        set.add(arg);
  }
}

export type ClassNameParam = undefined|null|false|string|Record<string, boolean>|ClassNameParam[];
