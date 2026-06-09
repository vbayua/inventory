export function AdjustTypeSelect({ data, setData }: { data: any; setData: any }) {
    return (
        <div className="mb-6">
            <Label className="mb-4 block">Jenis Adjustment</Label>
            <Select
                onValueChange={(value) => {
                    setData('adjustmentType', value);
                    setData('product', '');
                    setData('batch', '');
                    setData('location', '');
                    setData('quantity', 0);
                    setData('date', '');
                    setData('remarks', '');
                }}
                value={data.adjustmentType}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Adjustment Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="addition">Addition</SelectItem>
                        <SelectItem value="subtraction">Subtraction</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}

export function AdjustQuantitySection({ data, setData }: { data: any; setData: any }) {
    return (
        <>
            <div>
                <Label className="mb-2 block">Location</Label>
                <Select onValueChange={(value) => setData('location', value)} value={data.location}>
                    <SelectTrigger className={cn('w-full', errors.location && 'text-muted-foreground border-red-500')}>
                        <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {locations.length > 0 ? (
                                locations.map((location: Location) => (
                                    <SelectItem key={location.id} value={location.id.toString()}>
                                        {location.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="text-muted-foreground px-2 py-2">No locations available</div>
                            )}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label className="mb-2 block">Quantity</Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        value={data.quantity}
                        onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                        className={cn('w-full', errors.quantity && 'text-muted-foreground border-red-500')}
                        placeholder="Enter quantity"
                        min={1}
                        step={0.01}
                    />
                    <Select onValueChange={(value) => setData('unit', value)} value={data.unit}>
                        <SelectTrigger className={cn('w-full', errors.unit && 'text-muted-foreground border-red-500')}>
                            <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {filteredUnits.map((unit) => (
                                    <SelectItem key={unit.name} value={unit.name.toString()}>
                                        {unit.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                {selectedBatch && (
                    <p className="text-muted-foreground mt-1 text-sm">
                        Stock: {stockQuantity} {productUnit?.name || 'units'}
                    </p>
                )}
            </div>
        </>
    );
}
