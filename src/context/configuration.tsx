import { ViewOptions } from "@/Enum";
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
  startDate: new Date(),
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
  
  const value = useMemo(() => (new Object({ state: currentConfig, setState: setCurrentConfig })), [
    currentConfig.startDate,
    currentConfig.endDate,
    currentConfig.isExtraEnabled,
    currentConfig.walletsContent,
    currentConfig.view,
    setCurrentConfig
  ]) as ConfigurationContext;

  useEffect(() => console.log(currentConfig), [ currentConfig ]);

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};
