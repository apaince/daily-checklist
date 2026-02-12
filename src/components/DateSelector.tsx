import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import {
  Box,
  Button
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { addDays, isValid, subDays } from "date-fns";

interface DateSelectorProps {
  date: Date;
  onChange: (newValue: Date) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ date, onChange }) => (
  <Box display="flex" justifyContent="space-around">
    <Button sx={{ flexGrow: 1 }} onClick={() => onChange(subDays(date, 1))}>
      <ArrowBackIos />
    </Button>
    <DatePicker
    slotProps={{textField: {size:"small"}}}
      localeText={{}}
      format="yyyy/MM/dd"
      value={date}
      onChange={(newValue) => newValue && isValid(newValue) && onChange(newValue)}
    />
    <Button sx={{ flexGrow: 1 }} onClick={() => date && onChange(addDays(date, 1))}>
      <ArrowForwardIos />
    </Button>
  </Box>
);
