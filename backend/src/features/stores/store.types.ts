export interface Store {
    id: string;
    name: string;
    isOpen: boolean;
    userId: string;
}

//crear tienda
export interface CreateStoreDTO {
    name: string;
    userId: string;
    isOpen?: boolean;
}

//abrir y cerrar tienda
export interface UpdateStoreStatusDTO {
    isOpen: boolean;
}