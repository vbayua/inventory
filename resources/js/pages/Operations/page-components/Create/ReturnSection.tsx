export default function ReturnSection() {
    return (
        <>
            <div>
                <Label className="mb-2 block">Lokasi</Label>
                <Select onValueChange={(value) => setData('location', value)} value={data.location}>
                    <SelectTrigger className={cn('w-full', errors.location && 'text-muted-foreground border-red-500')}>
                        <SelectValue placeholder="Pilih lokasi" />
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
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn('w-full justify-between', errors.unit && 'text-muted-foreground border-red-500')}>
                                {data.unit ? data.unit : 'Select unit'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                            <SelectCommand
                                lists={filteredUnits}
                                getKey={(item) => item.name}
                                getId={(item) => item.name}
                                getLabel={(item) => item.name}
                                onSelect={(item) => {
                                    setData('unit', item.name);
                                }}
                                placeholder="Pilih unit"
                                renderItem={(item) => <span>{item.name}</span>}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                {selectedBatch && (
                    <p className="text-muted-foreground mt-1 text-sm">
                        {currentStock && `In Stock: ${Number(stockQuantity)} ${productUnit?.name || 'units'}`}
                    </p>
                )}
            </div>
        </>
    );
}
