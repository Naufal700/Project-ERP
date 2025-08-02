<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Sales Order - {{ $order->nomor_order }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .header, .footer {
            width: 100%;
            text-align: center;
            position: fixed;
        }
        .header {
            top: 0;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .footer {
            bottom: 0;
            font-size: 10px;
            color: #666;
        }
        .company-info {
            text-align: left;
            margin-bottom: 10px;
        }
        .company-info h2 {
            margin: 0;
        }
        .content {
            margin: 120px 25px 50px 25px;
        }
        .title {
            text-align: center;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        table th, table td {
            border: 1px solid #333;
            padding: 6px;
            text-align: left;
        }
        table th {
            background-color: #f2f2f2;
            text-align: center;
        }
        .summary {
            width: 50%;
            float: right;
            border: 1px solid #333;
            padding: 8px;
        }
        .summary td {
            padding: 4px;
        }
        .signature {
            margin-top: 40px;
            width: 100%;
            text-align: center;
        }
        .signature td {
            width: 33%;
            text-align: center;
            vertical-align: top;
            padding-top: 50px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="company-info">
            <h2>{{ config('app.name', 'ERP System') }}</h2>
            <p>Jl. Contoh No. 123, Jakarta<br>
            Telp: (021) 12345678 | Email: info@erp.com</p>
        </div>
    </div>

    <!-- Content -->
    <div class="content">
        <div class="title">Sales Order</div>

        <table>
            <tr>
                <td><strong>No. Sales Order:</strong> {{ $order->nomor_order }}</td>
                <td><strong>Tanggal:</strong> {{ \Carbon\Carbon::parse($order->tanggal)->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>No. Quotation:</strong> {{ $order->quotation->nomor_quotation ?? '-' }}</td>
            </tr>
            <tr>
                <td colspan="2">
                    <strong>Pelanggan:</strong><br>
                    {{ $order->pelanggan->nama_pelanggan 
                        ?? $order->quotation->pelanggan->nama_pelanggan 
                        ?? 'Pelanggan Umum' }}<br>
                    {{ $order->pelanggan->alamat 
                        ?? $order->quotation->pelanggan->alamat 
                        ?? '-' }}<br>
                    Telp: {{ $order->pelanggan->telepon 
                        ?? $order->quotation->pelanggan->telepon 
                        ?? '-' }}
                </td>
            </tr>
        </table>

        <!-- Detail Produk -->
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th>Produk</th>
                    <th style="width: 10%;">Qty</th>
                    <th style="width: 15%;">Harga</th>
                    {{-- <th style="width: 15%;">Diskon</th>
                    <th style="width: 15%;">PPN</th> --}}
                    <th style="width: 15%;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($order->details as $index => $detail)
                <tr>
                    <td style="text-align:center;">{{ $index + 1 }}</td>
                    <td>{{ $detail->produk->nama_produk ?? '-' }}</td>
                    <td style="text-align:center;">{{ number_format($detail->qty ?? 0, 0) }}</td>
                    <td style="text-align:right;">{{ number_format($detail->harga ?? 0, 0) }}</td>
                    {{-- <td style="text-align:right;">{{ number_format($detail->diskon ?? 0, 0) }}</td>
                    <td style="text-align:right;">{{ number_format($detail->ppn ?? 0, 0) }}</td> --}}
                    <td style="text-align:right;">
                        {{ number_format(($detail->qty ?? 0) * ($detail->harga ?? 0), 0) }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Summary -->
        @php 
            $subtotal = $order->details->sum(fn($d) => ($d->qty ?? 0) * ($d->harga ?? 0));
            $diskon   = $order->details->sum(fn($d) => $d->diskon ?? 0);
            $ppn      = $order->details->sum(fn($d) => $d->ppn ?? 0);
            $total    = $subtotal - $diskon + $ppn;
        @endphp

        <table class="summary">
            <tr>
                <td><strong>Subtotal</strong></td>
                <td style="text-align:right;">{{ number_format($subtotal, 0) }}</td>
            </tr>
            <tr>
                <td><strong>Total Diskon</strong></td>
                <td style="text-align:right;">{{ number_format($diskon, 0) }}</td>
            </tr>
            <tr>
                <td><strong>Total PPN</strong></td>
                <td style="text-align:right;">{{ number_format($ppn, 0) }}</td>
            </tr>
            <tr>
                <td><strong>Total</strong></td>
                <td style="text-align:right; font-weight: bold;">
                    {{ number_format($total, 0) }}
                </td>
            </tr>
        </table>

        <div style="clear:both;"></div>

        <!-- Signature -->
        <table class="signature">
            <tr>
                <td>Disiapkan oleh,<br><br><br>______________________</td>
                <td>Disetujui oleh,<br><br><br>{{ $order->approvedByUser->name ?? '______________________' }}</td>
                <td>Diterima oleh,<br><br><br>______________________</td>
            </tr>
        </table>
    </div>

    <!-- Footer -->
    <div class="footer">
        Dicetak pada: {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}
    </div>
</body>
</html>
