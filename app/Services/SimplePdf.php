<?php

namespace App\Services;

/**
 * Minimal valid PDF generator (no external dependency) for the seller contract.
 * Produces a single-page PDF with Helvetica (ISO-8859-1) lines.
 */
class SimplePdf
{
    protected array $lines = [];   // ['amount', 'x', 'y']

    protected array $objects = []; // object number => string body

    public function __construct(
        protected string $title = 'Document',
        protected string $author = 'Collection.ma',
    ) {}

    public function addLine(string $text, float $size = 12, float $x = 50, float $y = 700): self
    {
        $this->body[] = ['text' => $text, 'size' => $size, 'x' => $x, 'y' => $y];

        return $this;
    }

    public function escape(string $text): string
    {
        $text = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);

        return iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $text) ?: $text;
    }

    public function output(): string
    {
        // Content stream (object 5)
        $stream = '';
        foreach ($this->body as $line) {
            $stream .= 'BT /F1 '.$line['size'].' Tf '.$line['x'].' '.$line['y'].' Td ('.$this->escape($line['text']).") Tj ET\n";
        }

        $objects = [];

        // 1: Catalog
        $objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
        // 2: Pages
        $objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
        // 3: Page
        $objects[3] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>';
        // 4: Font
        $objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
        // 5: Contents
        $objects[5] = '<< /Length '.strlen($stream)." >>\nstream\n".$stream.'endstream';

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objects as $num => $body) {
            $offsets[$num] = strlen($pdf);
            $pdf .= $num." 0 obj\n".$body."\nendobj\n";
        }

        // xref
        $xrefStart = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n";
        $pdf .= "0000000000 65535 f \n";
        foreach ($offsets as $num => $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }

        $pdf .= "trailer\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n".$xrefStart."\n%%EOF";

        return $pdf;
    }
}
