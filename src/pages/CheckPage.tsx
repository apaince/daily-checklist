import { CheckCircle, RadioButtonUnchecked } from "@mui/icons-material";
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography
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
      <Divider sx={{ pt: 1 }} />
      <List dense sx={{ flexGrow: 1, overflow: "auto" }} component="div">
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
    )
      .sort()
      .map((taskKey) => {
        const storageData = localStorage.getItem(taskKey);
        if (storageData) return JSON.parse(storageData) as TaskStatus;
        const [, date, groupName, taskName] = taskKey.split("#");
        return { date, groupName, name: taskName, check: false };
      })
  );

  return (
    <>
      <ListItem sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
        <Typography>{group.name}</Typography>
        <Typography fontSize={14} color="textSecondary">
          {group.startHour}:00 ~
        </Typography>
      </ListItem>
      {datas.map((item, i) => (
        <ListItemButton
          key={item.name}
          sx={{ pl: 4, overflow: "hidden" }}
          disabled={disabled}
          onClick={() => {
            const newData = { ...item, check: !item.check };
            localStorage.setItem(`status#${date}#${group.name}#${item.name}`, JSON.stringify(newData));
            const newDatas = [...datas];
            newDatas[i] = newData;
            setDatas(newDatas);
          }}
        >
          <ListItemIcon>{item.check ? <CheckCircle color="success" /> : <RadioButtonUnchecked />}</ListItemIcon>
          <ListItemText sx={{wordBreak: "break-all"}} primary={item.name} />
        </ListItemButton>
      ))}
      <Divider />
    </>
  );
};
