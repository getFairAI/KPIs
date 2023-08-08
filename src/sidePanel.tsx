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


import React, { useState } from 'react';
import './App.css';
interface SidePanelProps {
    onUpdatedCharts: (startDate: Date, endDate: Date, isExtraEnabled: boolean, walletsContent: string) => void;
  }
  
  const SidePanel: React.FC<SidePanelProps> = ({ onUpdatedCharts }) => {
    const initialDate = new Date('2023-05-14');
    const finalDate = new Date();
    const [isExtraChartsEnabled, setExtraChartsEnabled] = useState(false);
    const [startDate, setStartDate] = useState<Date>(initialDate);
    const [endDate, setEndDate] = useState<Date>(finalDate);
    const [walletsContent, setWalletsContent] = useState<string>('');

  const handleDateChange = () => {
    if (startDate && endDate) {
        onUpdatedCharts(startDate, endDate,isExtraChartsEnabled,walletsContent);
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedEndDate = new Date(e.target.value);
    setStartDate(selectedEndDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedEndDate = new Date(e.target.value);
    setEndDate(selectedEndDate);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExtraChartsEnabled(e.target.checked);
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWalletsContent(e.target.value);
  };


  return (
    <div className="side-panel">
        <h2>Configuration</h2>
        <div className="date-picker">
            <label>Start Date: </label>
            <input type="date" value={startDate.toISOString().slice(0, 10)} onChange={handleStartDateChange} />
        </div>
        <div className="date-picker">
            <label>End Date: </label>
            <input type="date" value={endDate.toISOString().slice(0, 10)} onChange={handleEndDateChange} />
        </div>
        <div className="checkbox-container">
            <label>
                Show Extra Charts
                <input type="checkbox" checked={isExtraChartsEnabled} onChange={handleCheckboxChange} />
            </label>
         </div>
         <div className='textarea-container'>
            <label>
                Wallets to include
            <textarea  value={walletsContent} onChange={handleTextAreaChange} rows={7} cols={35} placeholder='address1 address2'/>
            </label>
         </div>
        <button className="update-button" onClick={handleDateChange}>Update Charts</button>
    </div>
  );
};

export default SidePanel;
