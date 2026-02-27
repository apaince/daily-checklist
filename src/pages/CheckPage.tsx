import {
  CheckCircle,
  DoneAll,
  ExpandLess,
  ExpandMore,
  RadioButtonUnchecked,
  RemoveDone,
  RestartAlt,
} from "@mui/icons-material";
import {
  Box,
  Collapse,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
} from "@mui/material";
import { format, startOfDay } from "date-fns";
import { useState, type FC } from "react";
import { getStorageKeys, type TaskGroup, type TaskStatus } from "../common";
import { DateSelector } from "../components";

export const CheckPage: FC = () => {
  const [date, setDate] = useState(new Date());
  const dateString = format(date, "yyyy-MM-dd");

  const groupDatas = getStorageKeys()
    .filter((item) => item.startsWith(`group#`))
    .map((groupString) => {
      const group = JSON.parse(localStorage.getItem(groupString)!) as TaskGroup;
      return {
        group,
        disabled:
          //表示時点の日付 + 時刻
          startOfDay(new Date()).getTime() + new Date().getHours() <
          //選択日付 + タスクグループ開始時刻
          startOfDay(date).getTime() + group.startHour,
      };
    })
    .sort((a, b) => a.group.startHour - b.group.startHour);

  return (
    <CheckPageInner key={dateString} date={date} setDate={setDate} dateString={dateString} groupDatas={groupDatas} />
  );
};

const CheckPageInner: FC<{
  date: Date;
  setDate: (date: Date) => void;
  dateString: string;
  groupDatas: {
    group: TaskGroup;
    disabled: boolean;
  }[];
}> = ({ date, setDate, dateString, groupDatas }) => {
  const [datas, setDatas] = useState<{ [groupName: string]: TaskStatus[] }>(
    groupDatas.reduce(
      (prev, { group }) => ({
        ...prev,
        [group.name]: Array.from(
          new Set([
            ...group.tasks.map((taskName) => `status#${dateString}#${group.name}#${taskName}`),
            ...(getStorageKeys().filter((item) => item.startsWith(`status#${dateString}#${group.name}#`)) ?? []),
          ])
        ).map((taskKey) => {
          const storageData = localStorage.getItem(taskKey);
          if (storageData) return JSON.parse(storageData) as TaskStatus;
          const [, date, groupName, taskName] = taskKey.split("#");
          return { date, groupName, name: taskName, check: false };
        }),
      }),
      {}
    )
  );
  const taskCount = Object.values(datas).reduce((prev, curr) => prev + curr.length, 0);
  const taskCheckCount = Object.values(datas).reduce(
    (prev, curr) => prev + curr.filter((item) => item.check).length,
    0
  );
  const taskComplete = Math.round((taskCheckCount / taskCount) * 100);

  return (
    <Stack height="0px" flexGrow={1} mx={1}>
      <Typography align="right" fontSize={10}>
        表示時刻：{format(date, "HH:mm")}
      </Typography>
      <Box display="flex">
        <DateSelector date={date} onChange={setDate} />
        <IconButton size="small" color="primary" onClick={() => setDate(new Date())}>
          <RestartAlt />
        </IconButton>
      </Box>
      <Typography position="relative" align="center" fontSize={10}>
        達成率：{taskComplete || "-"}%（&nbsp;{taskCheckCount}&nbsp;/&nbsp;{taskCount}&nbsp;）
      </Typography>
      <LinearProgress color={taskComplete === 100 ? "success" : "primary"} variant="determinate" value={taskComplete} />
      <List disablePadding sx={{ flexGrow: 1, overflow: "auto" }}>
        {groupDatas.map((groupData) => (
          <CheckGroupItem
            key={`${dateString}#${groupData.group.name}`}
            date={dateString}
            group={groupData.group}
            datas={datas[groupData.group.name]}
            setDatas={(newDatas: TaskStatus[]) =>
              setDatas((oldDatas) => ({ ...oldDatas, [groupData.group.name]: newDatas }))
            }
            disabled={groupData.disabled}
          />
        ))}
        {groupDatas.length === 0 && (
          <ListItem>
            <ListItemText
              sx={{ whiteSpace: "pre" }}
              primary={"タスクが登録されていません。\nSettingからタスクを登録してください。"}
            />
          </ListItem>
        )}
      </List>
      <Divider sx={{ mb: 1 }} />
    </Stack>
  );
};

const CheckGroupItem: FC<{
  date: string;
  group: TaskGroup;
  datas: TaskStatus[];
  setDatas: (newDatas: TaskStatus[]) => void;
  disabled: boolean;
}> = ({ date, group, disabled, datas, setDatas }) => {
  const isAllCheck = datas.every((item) => item.check);
  const [open, setOpen] = useState(!isAllCheck && !disabled);

  return (
    <>
      <ListSubheader sx={{ p: 0 }}>
        <ListItemButton onClick={() => setOpen(!open)} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Box sx={{ flexGrow: 1, display: "flex", gap: 1, alignItems: "center", overflow: "hidden" }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              position="absolute"
              width={20}
            >
              {isAllCheck ? (
                <DoneAll fontSize="small" color="success" />
              ) : (
                <RemoveDone fontSize="small" color="disabled" />
              )}
              <Typography fontSize={10}>
                {datas.filter((item) => item.check).length}&nbsp;/&nbsp;
                {datas.length}
              </Typography>
            </Box>
            <Typography sx={{ pl: 5 }} color={disabled ? "textDisabled" : "textPrimary"} whiteSpace="nowrap">
              {group.name}
            </Typography>
          </Box>
          <Typography fontSize={14} color="textSecondary" whiteSpace="nowrap">
            {group.startHour}:00 ~
          </Typography>
          {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
        </ListItemButton>
        <Divider sx={{ borderStyle: open ? "dashed" : undefined }} />
      </ListSubheader>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List dense disablePadding>
          {datas.map((item, i) => (
            <ListItemButton
              key={i}
              sx={{ pl: 4, overflow: "hidden" }}
              disabled={disabled}
              onClick={() => {
                const newData = { ...item, check: !item.check };
                if (item.check) {
                  localStorage.removeItem(`status#${date}#${group.name}#${item.name}`);
                } else {
                  localStorage.setItem(`status#${date}#${group.name}#${item.name}`, JSON.stringify(newData));
                }
                const newDatas = [...datas];
                newDatas[i] = newData;
                setDatas(newDatas);
              }}
            >
              <ListItemIcon>
                {item.check ? (
                  <CheckCircle color="success" />
                ) : (
                  <Box display="flex" position="relative" justifyContent="center">
                    <RadioButtonUnchecked />
                    <Typography position="absolute" fontSize={12} bottom={2}>
                      {i + 1}
                    </Typography>
                  </Box>
                )}
              </ListItemIcon>
              <ListItemText sx={{ wordBreak: "break-all" }} primary={item.name} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
      </Collapse>
    </>
  );
};
