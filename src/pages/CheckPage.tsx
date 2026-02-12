import { CheckCircle, DoneAll, ExpandLess, ExpandMore, RadioButtonUnchecked, RemoveDone } from "@mui/icons-material";
import {
  Box,
  Collapse,
  Divider,
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
    <Stack height="0px" flexGrow={1} mx={1}>
      <Typography align="right" fontSize={10}>
        表示時刻：{format(date, "HH:mm")}
      </Typography>
      <DateSelector date={date} onChange={setDate} />
      <Divider sx={{ mt: 1 }} />
      <List disablePadding sx={{ flexGrow: 1, overflow: "auto" }}>
        {groupDatas.map((groupData) => (
          <CheckGroupItem
            key={`${dateString}#${groupData.group.name}`}
            date={dateString}
            group={groupData.group}
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
  disabled: boolean;
}> = ({ date, group, disabled }) => {
  const [datas, setDatas] = useState<TaskStatus[]>(
    Array.from(
      new Set([
        ...group.tasks.map((taskName) => `status#${date}#${group.name}#${taskName}`),
        ...(getStorageKeys().filter((item) => item.startsWith(`status#${date}#${group.name}#`)) ?? []),
      ])
    ).map((taskKey) => {
      const storageData = localStorage.getItem(taskKey);
      if (storageData) return JSON.parse(storageData) as TaskStatus;
      const [, date, groupName, taskName] = taskKey.split("#");
      return { date, groupName, name: taskName, check: false };
    })
  );
  const isAllCheck = datas.reduce((prev, curr) => prev && curr.check, true);
  const [open, setOpen] = useState(!isAllCheck && !disabled);

  return (
    <>
      <ListSubheader sx={{ p: 0 }}>
        <ListItemButton onClick={() => setOpen(!open)} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Box sx={{ flexGrow: 1, display: "flex", gap: 1, alignItems: "center", overflow: "hidden" }}>
            {isAllCheck ? <DoneAll color="success" /> : <RemoveDone color="disabled" />}
            <Typography color={disabled ? "textDisabled" : "textPrimary"} whiteSpace="nowrap">
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
              key={item.name}
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
              <ListItemIcon>{item.check ? <CheckCircle color="success" /> : <RadioButtonUnchecked />}</ListItemIcon>
              <ListItemText sx={{ wordBreak: "break-all" }} primary={item.name} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
      </Collapse>
    </>
  );
};
