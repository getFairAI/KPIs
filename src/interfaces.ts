export interface ChartInfo {
    categories: string[];
    categoriesTitle: string;
    yTitle: string;
    chartTitle: string;
    yMin: number;
    yMax: number;
  }

  export interface ColumnChartInfo {
    categories: string[];
    chartTitle: string;
  }  

export interface DonutInfo {
    labels: string[];
    donutTitle: string;
  }
  
 export interface DateInfo {
    date: Date;
    unixTime: number;
 } 

 export interface OperatorTX {
    address: string;
    scriptTransaction: string;
    unixTime: number;
 }

 export interface Owner {
    address: string;
  }
 
export interface Block {
    timestamp: number;
}
  
  export interface Tag {
    name: string;
    value: string;
  }
  
  export interface Transaction {
    cursor: string;
    node: {
      fee: {
        ar: string;
      };
      id: string;
      owner: Owner;
      quantity: {
        ar: string;
        winston: string;
      };
      block: Block;
      tags: Tag[];
    };
  }
  