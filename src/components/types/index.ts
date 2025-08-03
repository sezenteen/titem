export interface Product {
  id: number;
  name: string;
  shortName: string;
  barcode: string;
  price: number;
  categoryID: {
    id: number;
    name: string;
    sortID: number;
  };
  allowCityTax: boolean;
  measureUnitID: {
    id: number;
    name: string;
    packageSize: number;
  };
  customCode: string;
  imagePath: string;
  packageCount: number;
  mainCategoryCode: string;
  isVATFree: boolean;
}
