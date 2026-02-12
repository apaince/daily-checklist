import { useState, type FC } from "react";
import { getStorageKeys } from "../common";
import { Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { addDays, format, subDays } from "date-fns";
import { DateSelector } from "../components";

export const CleanupPage: FC = () => {
  const [date, setDate] = useState(subDays(new Date(), 30));
  const dateString = format(addDays(date, 1), "yyyy-MM-dd");

  const keys = getStorageKeys();
  const groupNames = keys.filter((key) => key.startsWith("group#")).map((key) => key.split("#").pop()!);
  const statusKeys = keys.filter((key) => key.startsWith("status#"));
  const missingGroupKeys = statusKeys.filter((key) => {
    const [, , groupName] = key.split("#");
    return !groupNames.includes(groupName);
  });
  const olderDate = statusKeys.sort().slice(0, 1).pop()?.split("#")[1];
  const olderKeys = statusKeys.filter((key) => key < `status#${dateString}#`);

  return (
    <Stack height="0px" flexGrow={1} gap={1} m={1}>
      <Paper variant="outlined">
        <Stack p={2} gap={1}>
          <DateSelector date={date} onChange={setDate} />
          <Button
            variant="outlined"
            color="warning"
            disabled={!olderKeys.length}
            onClick={() => {
              olderKeys.forEach((key) => localStorage.removeItem(key));
              setDate(new Date(date));
            }}
          >
            以前のデータ{olderKeys.length}件を削除する
          </Button>
          <Divider />
          <Typography variant="body2" align="left">
            ※最古のチェックデータ：{olderDate ?? "None"}
          </Typography>
        </Stack>
      </Paper>
      <Paper variant="outlined">
        <Stack p={2} gap={1}>
          <Typography align="left">削除済みグループのチェックデータ</Typography>
          <Button
            variant="outlined"
            color="warning"
            disabled={!missingGroupKeys.length}
            onClick={() => {
              missingGroupKeys.forEach((key) => localStorage.removeItem(key));
              setDate(new Date(date));
            }}
          >
            {missingGroupKeys.length}件を削除する
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};
