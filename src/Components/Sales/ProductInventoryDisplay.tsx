"use client"
import { Tag } from "../Products/ProductDetails"
import { NairaSymbol, ProductTag } from "../CardComponents/CardComponent"
import { RiDeleteBin5Fill } from "react-icons/ri"
import { Minus, Plus } from "lucide-react"
import { observer } from "mobx-react-lite"

export const InventoryDetailRow = ({
    label,
    value,
    showNaira = false,
    title,
}: {
    label: string
    value: string | number
    showNaira?: boolean
    title?: string
}) => (
    <div className="flex items-center justify-between gap-2 w-full">
        <Tag name={label} />
        <p className="flex gap-1 items-center justify-end text-xs font-bold text-textDarkGrey" title={title}>
            {showNaira && <NairaSymbol />}
            {label === "Category" ? <ProductTag productTag={value} /> : value}
        </p>
    </div>
)

const ProductInventoryDisplay = observer(
    ({
        inventoryData,
        onRemoveInventory,
        onUpdateQuantity,
    }: {
        inventoryData: {
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
        onRemoveInventory: (inventoryId: string) => void
        onUpdateQuantity: (inventoryId: string, quantity: number) => void
    }) => {
        const { inventoryId, itemName, category, priceRange, currentPrice, availableStock, selectedQuantity, description } =
            inventoryData

        const handleQuantityChange = (newQuantity: number) => {
            if (newQuantity >= 1 && newQuantity <= availableStock) {
                onUpdateQuantity(inventoryId, newQuantity)
            }
        }

        const totalPrice = currentPrice * selectedQuantity

        return (
            <div className="flex flex-col gap-3 w-full p-3 border-[0.6px] border-strokeGreyThree rounded-[20px] bg-white">
                {/* Header with item name and remove button */}
                <div className="flex items-center justify-between w-full">
                    <h3 className="text-lg font-semibold text-textBlack">{itemName}</h3>
                    <button
                        className="flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 cursor-pointer border-[0.6px] border-red-200 rounded-full transition-all"
                        title="Remove Item"
                        onClick={() => onRemoveInventory(inventoryId)}
                    >
                        <RiDeleteBin5Fill color="#FC4C5D" size={16} />
                    </button>
                </div>

                {/* Item details */}
                <div className="flex flex-col gap-2">
                    <InventoryDetailRow label="Category" value={category} />
                    <InventoryDetailRow label="Price Range" value={priceRange} />
                    <InventoryDetailRow label="Current Price" value={currentPrice.toLocaleString()} showNaira={true} />
                    <InventoryDetailRow label="Available Stock" value={availableStock} />
                    {description && <InventoryDetailRow label="Description" value={description} />}
                </div>

                {/* Quantity controls */}
                <div className="flex flex-col gap-3 p-3 bg-[#F9F9F9] border-[0.6px] border-strokeGreyThree rounded-[15px]">
                    <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-medium text-textDarkGrey">Quantity</span>
                        <div className="flex items-center gap-3">
                            <button
                                className="flex items-center justify-center w-8 h-8 bg-white border-[0.6px] border-strokeGreyTwo rounded-full hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleQuantityChange(selectedQuantity - 1)}
                                disabled={selectedQuantity <= 1}
                            >
                                <Minus size={16} className="text-textDarkGrey" />
                            </button>

                            <span className="flex items-center justify-center min-w-[40px] h-8 px-3 bg-white border-[0.6px] border-strokeGreyTwo rounded-lg text-sm font-semibold text-textBlack">
                                {selectedQuantity}
                            </span>

                            <button
                                className="flex items-center justify-center w-8 h-8 bg-white border-[0.6px] border-strokeGreyTwo rounded-full hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleQuantityChange(selectedQuantity + 1)}
                                disabled={selectedQuantity >= availableStock}
                            >
                                <Plus size={16} className="text-textDarkGrey" />
                            </button>
                        </div>
                    </div>

                    {/* Stock warning */}
                    {selectedQuantity === availableStock && (
                        <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="text-xs text-orange-700 font-medium">Maximum stock selected</span>
                        </div>
                    )}

                    {/* Total price */}
                    <div className="flex items-center justify-between w-full pt-2 border-t border-strokeGreyTwo">
                        <span className="text-sm font-medium text-textDarkGrey">Total Price</span>
                        <div className="flex items-center gap-1">
                            <NairaSymbol />
                            <span className="text-lg font-bold text-textBlack">{totalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 w-full">
                    <button
                        className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-medium text-blue-700 transition-all"
                        onClick={() => handleQuantityChange(Math.min(5, availableStock))}
                    >
                        Set to 5
                    </button>
                    <button
                        className="flex-1 py-2 px-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium text-green-700 transition-all"
                        onClick={() => handleQuantityChange(Math.min(10, availableStock))}
                    >
                        Set to 10
                    </button>
                    <button
                        className="flex-1 py-2 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-sm font-medium text-purple-700 transition-all"
                        onClick={() => handleQuantityChange(availableStock)}
                    >
                        Max Stock
                    </button>
                </div>
            </div>
        )
    },
)

export default ProductInventoryDisplay
