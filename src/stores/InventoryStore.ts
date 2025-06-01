import { makeAutoObservable } from "mobx"

export interface InventoryItem {
    inventoryId: string
    itemName: string
    category: string
    priceRange: string
    currentPrice: number
    availableStock: number
    selectedQuantity: number
    itemImage?: string
    description?: string
}

class InventoryStore {
    inventoryItems: InventoryItem[] = []

    constructor() {
        makeAutoObservable(this)
    }

    addInventoryItem = (item: InventoryItem) => {
        const existingIndex = this.inventoryItems.findIndex((existing) => existing.inventoryId === item.inventoryId)

        if (existingIndex >= 0) {
            // Update existing item quantity
            this.inventoryItems[existingIndex].selectedQuantity += item.selectedQuantity
        } else {
            // Add new item
            this.inventoryItems.push({ ...item, selectedQuantity: item.selectedQuantity || 1 })
        }
    }

    removeInventoryItem = (inventoryId: string) => {
        this.inventoryItems = this.inventoryItems.filter((item) => item.inventoryId !== inventoryId)
    }

    updateInventoryQuantity = (inventoryId: string, quantity: number) => {
        const item = this.inventoryItems.find((item) => item.inventoryId === inventoryId)
        if (item) {
            item.selectedQuantity = quantity
        }
    }

    clearInventoryItems = () => {
        this.inventoryItems = []
    }

    get totalInventoryValue() {
        return this.inventoryItems.reduce((total, item) => total + item.currentPrice * item.selectedQuantity, 0)
    }

    get totalInventoryItems() {
        return this.inventoryItems.reduce((total, item) => total + item.selectedQuantity, 0)
    }
}

export const inventoryStore = new InventoryStore()
