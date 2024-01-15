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

import { ReactNode, createContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

type viewOption = 'daily' | 'weekly' | 'monthly';

const changeVersionsDate = '2023-09-01';

interface ConfigurationValues {
  startDate: Date, endDate: Date, isExtraEnabled: boolean, walletsContent: string, view: viewOption
}

interface ConfigurationContext {
  state: ConfigurationValues;
  setState: React.Dispatch<React.SetStateAction<ConfigurationValues>>;
}

const initialState: ConfigurationValues = {
  startDate: new Date(changeVersionsDate),
  endDate: new Date(),
  isExtraEnabled: false,
  walletsContent: '',
  view: 'monthly'
};

export const ConfigurationContext = createContext<ConfigurationContext>({
  state: initialState,
  setState: () => null
});

export const ConfigurationProvider = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const [ currentConfig, setCurrentConfig ] = useState<ConfigurationValues>(initialState);
  
  const value = useMemo(() => ({ state: currentConfig, setState: setCurrentConfig }), [
    currentConfig,
    setCurrentConfig
  ]);

  useEffect(() => {
    if (pathname.includes('alpha')) {
      setCurrentConfig((prevState) => ({
        ...prevState,
        startDate: new Date('2023-04-25'),
        endDate: new Date(changeVersionsDate),
      }));
 
    } else {
      setCurrentConfig((prevState) => ({
        ...prevState,
        startDate: new Date(changeVersionsDate),
        endDate: new Date(),
      }));
    }
  }, [ pathname ]);


  useEffect(() => console.log(currentConfig), [ currentConfig ]);

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};
