/*
 * Fair Protocol - KPIs
 * Copyright (C) 2023 Fair Protocol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 */

import React, { useCallback, useContext, useEffect, useState } from "react";
import { ConfigurationContext } from "./context/configuration";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Checkbox,
  TextField,
  IconButton,
  Typography,
  Button,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";
import {
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarYears,
} from "date-fns";
import { enqueueSnackbar } from "notistack";

type viewOption = "daily" | "weekly" | "monthly";

const SidePanel = ({ handleClose }: { handleClose: () => void }) => {
  const { pathname } = useLocation();
  const { setState: setConfigState } = useContext(ConfigurationContext);
  const [viewValue, setViewValue] = useState<viewOption>("monthly");
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(
    new Date()
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(new Date());
  const [isExtraEnabled, setIsExtraEnabled] = useState<boolean>(false);
  const [walletsContent, setWalletsContent] = useState<string>("");
  const defaultMinDate = new Date("2024-04-15");

  // if default end date (today date) is currently more than half a year (183 days) after the default start date, lock it to 31 dec 2024, else use today date
  const defaultEndDate =
    differenceInCalendarDays(new Date("2024-12-31"), new Date()) > 183
      ? new Date("2024-12-31")
      : new Date();
  const minDateForPicker = new Date("2024-04-15");
  const maxDateForPicker = new Date(); // today date

  useEffect(() => {
    if (pathname.includes("alpha")) {
      setStartDateFilter(defaultMinDate);
      setEndDateFilter(defaultEndDate);
    } else {
      setStartDateFilter(defaultMinDate);
      setEndDateFilter(defaultEndDate);
    }
  }, [pathname]);

  const handleStartDateChange = useCallback(
    (e: Date | null) => {
      if (e) {
        setStartDateFilter(e);
      }
    },
    [setStartDateFilter]
  );

  const handleEndDateChange = useCallback(
    (e: Date | null) => {
      if (e) {
        setEndDateFilter(e);
      }
    },
    [setEndDateFilter]
  );

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsExtraEnabled(e.target.checked);
    },
    [setIsExtraEnabled]
  );

  const handleTextAreaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setWalletsContent(e.target.value);
    },
    [setWalletsContent]
  );

  const handleViewOptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setViewValue(e.target.value as viewOption);
    },
    [setViewValue]
  );

  const handleUpdateCharts = useCallback(() => {
    const dateModeSelected = viewValue;

    if (
      dateModeSelected === "daily" &&
      differenceInCalendarDays(endDateFilter!, startDateFilter!) > 14
    ) {
      enqueueSnackbar(
        'With "Daily" option selected, you are limited to a maximum of 2 weeks (14 days) between your start date and end date.',
        {
          variant: "error",
        }
      );
      return;
    } else if (
      dateModeSelected === "weekly" &&
      differenceInCalendarDays(endDateFilter!, startDateFilter!) > 31
    ) {
      enqueueSnackbar(
        'With "Weekly" option selected, you are limited to a maximum of 1 month (31 days) between your start date and end date.',
        {
          variant: "error",
        }
      );
      return;
    } else if (
      dateModeSelected === "monthly" &&
      differenceInCalendarDays(endDateFilter!, startDateFilter!) > 365
    ) {
      enqueueSnackbar(
        'With "Monthly" option selected, you are limited to a maximum of 1 year (365 days) between your start date and end date.',
        {
          variant: "error",
        }
      );
      return;
    }
    setConfigState((previous) => ({
      ...previous,
      startDate: startDateFilter || new Date(),
      endDate: endDateFilter || new Date(),
      view: viewValue,
      isExtraEnabled,
      walletsContent,
    }));
  }, [
    startDateFilter,
    endDateFilter,
    viewValue,
    walletsContent,
    isExtraEnabled,
    setConfigState,
  ]);

  return (
    <>
      <Box
        display={"flex"}
        flexDirection={"column"}
        padding={"16px"}
        gap={"16px"}
      >
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography
            sx={{ fontWeight: 700, fontSize: "23px", lineHeight: "31px" }}
          >
            {"Configuration"}
          </Typography>
        </Box>
        <Box>
          <FormControl component="fieldset" variant="standard">
            <FormLabel>View</FormLabel>
            <RadioGroup value={viewValue} onChange={handleViewOptionChange}>
              <FormControlLabel
                control={<Radio />}
                value={"daily"}
                label="Daily"
              />
              <FormControlLabel
                control={<Radio />}
                value={"weekly"}
                label="Weekly"
              />
              <FormControlLabel
                control={<Radio />}
                value={"monthly"}
                label="Monthly"
              />
            </RadioGroup>
          </FormControl>
        </Box>
        <Box display={"flex"} gap={"8px"}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDateFilter}
              onChange={handleStartDateChange}
              minDate={minDateForPicker}
              maxDate={endDateFilter ?? maxDateForPicker}
            />
            <DatePicker
              label="End Date"
              value={endDateFilter}
              onChange={handleEndDateChange}
              minDate={startDateFilter ?? minDateForPicker}
              maxDate={maxDateForPicker}
            />
          </LocalizationProvider>
        </Box>
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={isExtraEnabled}
                onChange={handleCheckboxChange}
              />
            }
            label="Show Extra Charts"
          />
        </Box>
        <Box>
          <TextField
            label={"Wallets to include"}
            value={walletsContent}
            onChange={handleTextAreaChange}
            multiline
            minRows={2}
            maxRows={6}
            fullWidth
          />
        </Box>
        <Box display={"flex"} justifyContent={"center"}>
          <Button variant="outlined" onClick={handleUpdateCharts}>
            Update Charts
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default SidePanel;
