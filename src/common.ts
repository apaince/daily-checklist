
/** group#${groupName} */
export type TaskGroup = {
  name: string;
  startHour: number;
  tasks: string[];
};

/** status#${date}#${groupName}#${taskName} */
export type TaskStatus = {
  date: string;
  groupName: string;
  name: string;
  check: boolean;
};

export const getStorageKeys = () => {
  const ret: string[] = [];
  for (let index = 0; index < localStorage.length; index++) {
    ret.push(localStorage.key(index)!);
  }
  return ret;
};
