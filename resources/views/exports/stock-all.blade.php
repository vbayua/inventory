<table align="center" width=100>
        <tr height=60>
            <td colspan=6 style="border: 1px solid #000000; font-size: 16px; font-weight: bold;" align="center" valign="middle">
                <h1>PT. IMPERIAL KOSMETIKA INDONESIA</h1>
                <p>Kartu Stok</p>
            </td>
        </tr>
        <tr>
            <td colspan=6 style="border: 0px; height:25px"></td>
        </tr>
        <tr height=50 style="border: 1px solid #000000;">
            <td style="font-size: 14px; font-weight: bold;" valign="middle">Nama Bahan</td>
            <td colspan=3 style="font-size: 14px;" valign="middle">: {{$stock->product->name}}</td>
            <td style="font-size: 14px; font-weight: bold;" valign="middle">Kode Item</td>
            <td colspan=3 style="font-size: 14px;" valign="middle">: {{$stock->product->sku}}</td>
        </tr>
        <tr height=50 style="border: 1px solid #000000;">
            <td style="font-size: 14px; font-weight: bold;" valign="middle">Jumlah Lokasi</td>
            <td colspan=3 style="font-size: 14px;" valign="middle">: {{$stock->total_locations}}</td>
            <td style="font-size: 14px; font-weight: bold;" valign="middle">No. Batch</td>
            <td colspan=3 style="font-size: 14px;" valign="middle">: {{$stock->batch->batch_number}}</td>
        </tr>
        <tr height=50 style="border: 1px solid #000000;">
            <td style="font-size: 14px; font-weight: bold;" valign="middle">Tanggal Kadaluarsa</td>
            <td colspan=3 style="font-size: 14px;" valign="middle">: {{$stock->batch->expiry_date}}</td>
            <td style="font-size: 14px; font-weight: bold;" valign="middle">Periode</td>
            <td colspan=3 style="font-size: 14px;" valign="middle">: {{$period}}</td>
        </tr>
        <tr>
            <td colspan=6 style="border: 0px; height:25px"></td>
        </tr>
        <tr>
            <td colspan=6 style="border: 0px; height:25px"></td>
        </tr>
</table>
<table align="center" width=100>
    <thead>
        <tr width=100 height=50>
            <td style="border: 1px solid #000000; font-size: 14px; font-weight: bold;" align="center" valign="middle">Tanggal</td>
            <td style="border: 1px solid #000000; font-size: 14px; font-weight: bold;" align="center" valign="middle">Lokasi</td>
            <td style="border: 1px solid #000000; font-size: 14px; font-weight: bold;" align="center" valign="middle">Masuk</td>
            <td style="border: 1px solid #000000; font-size: 14px; font-weight: bold;" align="center" valign="middle">Keluar</td>
            <td style="border: 1px solid #000000; font-size: 14px; font-weight: bold;" align="center" valign="middle">Balance</td>
            <td style="border: 1px solid #000000; font-size: 14px; font-weight: bold;" align="center" valign="middle">Keterangan</td>
        </tr>
    </thead>
    <tbody>
        @foreach ($operations as $operation)
            <tr height=40>
                <td style="border: 1px solid #000000; font-size: 16px;">{{ $operation->operation_date }}</td>
                <td style="border: 1px solid #000000; font-size: 16px;">{{ $operation->location->name }}</td>

                {{-- <td style="border: 1px solid #000000; font-size: 16px;" align="center">{{ucfirst($operation->operation_type)}}</td>
                <td style="border: 1px solid #000000; font-size: 16px;" align="center">
                    {{$operation->quantity}}
                </td> --}}
                <td style="border: 1px solid #000000; font-size: 16px;" align="center" width=25>
                    {{ $operation->delta > 0 ? $operation->delta : '' }}
                </td>
                <td style="border: 1px solid #000000; font-size: 16px;" align="center" width=25>
                    {{ $operation->delta < 0 ? abs($operation->delta) : '' }}
                </td>
                <td style="border: 1px solid #000000; font-size: 16px;" align="center">{{ $operation->balance }}</td>
                <td style="border: 1px solid #000000; font-size: 16px; word-wrap:break-word;" align="left" width=50>{{$operation->remarks ?? '-'}}</td>
            </tr>
        @endforeach
    </tbody>
</table>
