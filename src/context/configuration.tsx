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

type viewOption = 'daily' | 'weekly' | 'monthly';

interface ConfigurationValues {
  startDate: Date, endDate: Date, isExtraEnabled: boolean, walletsContent: string, view: viewOption
}

interface ConfigurationContext {
  state: ConfigurationValues;
  setState: React.Dispatch<React.SetStateAction<ConfigurationValues>>;
}

const initialState: ConfigurationValues = {
  startDate: new Date('2023-09-17'),
  endDate: new Date(),
  isExtraEnabled: false,
  walletsContent: '',
  view: 'weekly'
};

export const ConfigurationContext = createContext<ConfigurationContext>({
  state: initialState,
  setState: () => null
});

export const ConfigurationProvider = ({ children }: { children: ReactNode }) => {
  const [ currentConfig, setCurrentConfig ] = useState<ConfigurationValues>(initialState);
  
  const value = useMemo(() => ({ state: currentConfig, setState: setCurrentConfig }), [
    currentConfig,
    setCurrentConfig
  ]);

  useEffect(() => console.log(currentConfig), [ currentConfig ]);

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};
