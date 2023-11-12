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

import React, { useContext, useState } from 'react';
import { ConfigurationContext } from './context/configuration';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Box, Checkbox, TextField, IconButton, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';

type viewOption = 'daily' | 'weekly' | 'monthly';

const SidePanel = ({ handleClose }: { handleClose: () => void }) => {
  const { state: configState, setState: setConfigState } = useContext(ConfigurationContext);
  const [ viewValue, setViewValue ] = useState<viewOption>('weekly');
  const [ startDateFilter, setStartDateFilter ] = useState<Date | null>(configState.startDate);
  const [ endDateFilter, setEndDateFilter ] = useState<Date | null>(configState.endDate);
  const [ isExtraEnabled, setIsExtraEnabled ] = useState<boolean>(configState.isExtraEnabled);
  const [ walletsContent, setWalletsContent ] = useState<string>(configState.walletsContent);

  const handleStartDateChange = (e: Date | null) => {
    if (e) {
      setStartDateFilter(e);
      setConfigState((previousState) => ({ ...previousState, startDate: e }));
    }
  };

  const handleEndDateChange = (e: Date | null) => {
    if (e) {
      setEndDateFilter(e);
      setConfigState((previousState) => ({ ...previousState, startDate: e }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsExtraEnabled(e.target.checked);
    setConfigState((previousState) => ({ ...previousState, isExtraChartsEnabled: e.target.checked }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWalletsContent(e.target.value);
    setConfigState((previousState) => ({ ...previousState, walletsContent: e.target.value }));
  };

  const handleViewOptionChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setViewValue(e.target.value as viewOption);
    setConfigState((previousState) => ({ ...previousState, view: e.target.value as viewOption }));
  }

  return (<>
    <Box display={'flex'} flexDirection={'column'} padding={'16px'} gap={'16px'}>
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: '23px', lineHeight: '31px' }}>
          {'Configuration'}
        </Typography>
      </Box>
      <Box>
        <FormControl component='fieldset' variant='standard'>
          <FormLabel>View</FormLabel>
          <RadioGroup value={viewValue} onChange={handleViewOptionChange}>
            <FormControlLabel
              control={<Radio />}
              value={'daily'}
              label='Daily'
            />
            <FormControlLabel
              control={<Radio />}
              value={'weekly'}
              label='Weekly'
            />
            <FormControlLabel control={<Radio />} value={'monthly'} label='Monthly' />
          </RadioGroup>
        </FormControl>
      </Box>
      <Box display={'flex'} gap={'8px'}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label='Start Date'
            value={startDateFilter}
            onChange={handleStartDateChange}
          />
          <DatePicker
            label='End Date'
            value={endDateFilter}
            onChange={handleEndDateChange}
          />
        </LocalizationProvider>
      </Box>
      <Box>
        <FormControlLabel
          control={<Checkbox checked={isExtraEnabled} onChange={handleCheckboxChange}/>}
          label='Show Extra Charts'
        />
      </Box>
      <Box>
        <TextField
          label={'Wallets to include'}
          value={walletsContent}
          onChange={handleTextAreaChange}
          multiline
          minRows={2}
          maxRows={6}
          fullWidth
        />
      </Box>
    </Box>
   
    {/* <div className="side-panel">
        <h2>Configuration</h2>
        <div className='view-selector'>
          <label>View: </label>
          <div className='radio-option'>
            <label>
            <input type='radio' value={ViewOptions.DAILY} checked={configState.view === ViewOptions.DAILY} name='View' onChange={handleViewOptionChange}/> Daily
            </label> 
          </div>
          <div className='radio-option'>
            <label>
              <input type='radio' value={ViewOptions.WEEKLY} checked={configState.view === ViewOptions.WEEKLY} name='View' onChange={handleViewOptionChange}/> Weekly
            </label> 
          </div>
          <div className='radio-option'>
            <label>
            <input type='radio' value={ViewOptions.MONTHLY} checked={configState.view === ViewOptions.MONTHLY} name='View' onChange={handleViewOptionChange}/> Monthly
            </label> 
          </div>
        </div>
        <div className="date-picker">
            <label>Start Date: </label>
            <input type="date" value={configState.startDate.toISOString().slice(0, 10)} onChange={handleStartDateChange} />
        </div>
        <div className="date-picker">
            <label>End Date: </label>
            <input type="date" value={configState.endDate.toISOString().slice(0, 10)} onChange={handleEndDateChange} />
        </div>
        <div className="checkbox-container">
            <label>
                Show Extra Charts
                <input type="checkbox" checked={configState.isExtraEnabled} onChange={handleCheckboxChange} />
            </label>
         </div>
         <div className='textarea-container'>
            <label>
                Wallets to include
            <textarea  value={configState.walletsContent} onChange={handleTextAreaChange} rows={7} cols={35} style={{maxWidth: '100%'}} placeholder='address1 address2'/>
            </label>
         </div>
    </div> */}
  </>);
};

export default SidePanel;
