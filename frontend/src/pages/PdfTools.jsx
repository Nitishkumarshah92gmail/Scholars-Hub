import { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import toast from 'react-hot-toast';
import {
    HiDocumentAdd,
    HiScissors,
    HiRefresh,
    HiPhotograph,
    HiLockClosed,
    HiDownload,
    HiX,
    HiUpload,
    HiCollection,
    HiTag,
} from 'react-icons/hi';

const TOOLS = [
    { id: 'merge', label: 'Merge PDF', desc: 'Combine multiple PDFs into one', icon: HiDocumentAdd, color: 'bg-red-500' },
    { id: 'split', label: 'Split PDF', desc: 'Extract pages from a PDF', icon: HiScissors, color: 'bg-orange-500' },
    { id: 'compress', label: 'Compress PDF', desc: 'Reduce PDF file size', icon: HiDownload, color: 'bg-green-500' },
    { id: 'rotate', label: 'Rotate PDF', desc: 'Rotate pages in any direction', icon: HiRefresh, color: 'bg-blue-500' },
    { id: 'jpg-to-pdf', label: 'JPG to PDF', desc: 'Convert images to PDF', icon: HiPhotograph, color: 'bg-purple-500' },
    { id: 'watermark', label: 'Add Watermark', desc: 'Stamp text on PDF pages', icon: HiTag, color: 'bg-yellow-500' },
    { id: 'page-numbers', label: 'Page Numbers', desc: 'Add page numbers to PDF', icon: HiCollection, color: 'bg-pink-500' },
    { id: 'protect', label: 'Protect PDF', desc: 'Add password to your PDF', icon: HiLockClosed, color: 'bg-indigo-500' },
];

function downloadBlob(bytes, name) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
}

export default function PdfTools() {
    const [activeTool, setActiveTool] = useState(null);
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [extraInput, setExtraInput] = useState('');
    const [rotateAngle, setRotateAngle] = useState(90);
    const fileRef = useRef();

    const resetTool = () => { setActiveTool(null); setFiles([]); setExtraInput(''); };

    const handleFiles = (e) => {
        const selected = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selected]);
    };

    const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

    /* ─── MERGE PDF ─── */
    const mergePdfs = async () => {
        if (files.length < 2) return toast.error('Select at least 2 PDFs to merge.');
        setProcessing(true);
        try {
            const merged = await PDFDocument.create();
            for (const file of files) {
                const bytes = await file.arrayBuffer();
                const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
                const pages = await merged.copyPages(doc, doc.getPageIndices());
                pages.forEach(p => merged.addPage(p));
            }
            const out = await merged.save();
            downloadBlob(out, 'merged.pdf');
            toast.success('PDFs merged!');
        } catch (e) { toast.error(e.message || 'Failed to merge.'); }
        finally { setProcessing(false); }
    };

    /* ─── SPLIT PDF ─── */
    const splitPdf = async () => {
        if (files.length === 0) return toast.error('Select a PDF.');
        const range = extraInput.trim();
        if (!range) return toast.error('Enter page numbers, e.g. 1-3 or 1,3,5');
        setProcessing(true);
        try {
            const bytes = await files[0].arrayBuffer();
            const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
            const total = src.getPageCount();
            let indices = [];
            range.split(',').forEach(part => {
                const p = part.trim();
                if (p.includes('-')) {
                    const [s, e] = p.split('-').map(Number);
                    for (let i = s; i <= Math.min(e, total); i++) indices.push(i - 1);
                } else {
                    const n = parseInt(p);
                    if (n >= 1 && n <= total) indices.push(n - 1);
                }
            });
            if (indices.length === 0) return toast.error('Invalid page range.');
            const out = await PDFDocument.create();
            const pages = await out.copyPages(src, indices);
            pages.forEach(p => out.addPage(p));
            const result = await out.save();
            downloadBlob(result, 'split.pdf');
            toast.success('PDF split!');
        } catch (e) { toast.error(e.message || 'Failed to split.'); }
        finally { setProcessing(false); }
    };

    /* ─── COMPRESS PDF ─── */
    const compressPdf = async () => {
        if (files.length === 0) return toast.error('Select a PDF.');
        setProcessing(true);
        try {
            const bytes = await files[0].arrayBuffer();
            const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
            const out = await doc.save({ useObjectStreams: true });
            const saved = ((bytes.byteLength - out.length) / bytes.byteLength * 100).toFixed(1);
            downloadBlob(out, 'compressed.pdf');
            toast.success(`Compressed! Saved ${Math.max(0, saved)}%`);
        } catch (e) { toast.error(e.message || 'Failed to compress.'); }
        finally { setProcessing(false); }
    };

    /* ─── ROTATE PDF ─── */
    const rotatePdf = async () => {
        if (files.length === 0) return toast.error('Select a PDF.');
        setProcessing(true);
        try {
            const bytes = await files[0].arrayBuffer();
            const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
            doc.getPages().forEach(page => page.setRotation(degrees(page.getRotation().angle + rotateAngle)));
            const out = await doc.save();
            downloadBlob(out, 'rotated.pdf');
            toast.success('PDF rotated!');
        } catch (e) { toast.error(e.message || 'Failed to rotate.'); }
        finally { setProcessing(false); }
    };

    /* ─── JPG TO PDF ─── */
    const jpgToPdf = async () => {
        if (files.length === 0) return toast.error('Select images.');
        setProcessing(true);
        try {
            const doc = await PDFDocument.create();
            for (const file of files) {
                const bytes = await file.arrayBuffer();
                let img;
                if (file.type === 'image/png') img = await doc.embedPng(bytes);
                else img = await doc.embedJpg(bytes);
                const page = doc.addPage([img.width, img.height]);
                page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
            }
            const out = await doc.save();
            downloadBlob(out, 'images.pdf');
            toast.success('Images converted to PDF!');
        } catch (e) { toast.error(e.message || 'Failed to convert.'); }
        finally { setProcessing(false); }
    };

    /* ─── WATERMARK ─── */
    const addWatermark = async () => {
        if (files.length === 0) return toast.error('Select a PDF.');
        const text = extraInput.trim();
        if (!text) return toast.error('Enter watermark text.');
        setProcessing(true);
        try {
            const bytes = await files[0].arrayBuffer();
            const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
            const font = await doc.embedFont(StandardFonts.HelveticaBold);
            doc.getPages().forEach(page => {
                const { width, height } = page.getSize();
                page.drawText(text, {
                    x: width / 2 - font.widthOfTextAtSize(text, 50) / 2,
                    y: height / 2,
                    size: 50,
                    font,
                    color: rgb(0.75, 0.75, 0.75),
                    opacity: 0.3,
                    rotate: degrees(45),
                });
            });
            const out = await doc.save();
            downloadBlob(out, 'watermarked.pdf');
            toast.success('Watermark added!');
        } catch (e) { toast.error(e.message || 'Failed.'); }
        finally { setProcessing(false); }
    };

    /* ─── PAGE NUMBERS ─── */
    const addPageNumbers = async () => {
        if (files.length === 0) return toast.error('Select a PDF.');
        setProcessing(true);
        try {
            const bytes = await files[0].arrayBuffer();
            const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
            const font = await doc.embedFont(StandardFonts.Helvetica);
            const pages = doc.getPages();
            pages.forEach((page, i) => {
                const { width } = page.getSize();
                const text = `${i + 1} / ${pages.length}`;
                page.drawText(text, {
                    x: width / 2 - font.widthOfTextAtSize(text, 10) / 2,
                    y: 20,
                    size: 10,
                    font,
                    color: rgb(0.4, 0.4, 0.4),
                });
            });
            const out = await doc.save();
            downloadBlob(out, 'numbered.pdf');
            toast.success('Page numbers added!');
        } catch (e) { toast.error(e.message || 'Failed.'); }
        finally { setProcessing(false); }
    };

    /* ─── PROTECT PDF ─── */
    const protectPdf = async () => {
        if (files.length === 0) return toast.error('Select a PDF.');
        const pwd = extraInput.trim();
        if (!pwd) return toast.error('Enter a password.');
        setProcessing(true);
        try {
            const bytes = await files[0].arrayBuffer();
            const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
            const out = await doc.save({
                userPassword: pwd,
                ownerPassword: pwd + '_owner',
                permissions: { printing: 'lowResolution', copying: false, modifying: false },
            });
            downloadBlob(out, 'protected.pdf');
            toast.success('PDF protected with password!');
        } catch (e) { toast.error(e.message || 'Failed.'); }
        finally { setProcessing(false); }
    };

    const runTool = () => {
        switch (activeTool) {
            case 'merge': return mergePdfs();
            case 'split': return splitPdf();
            case 'compress': return compressPdf();
            case 'rotate': return rotatePdf();
            case 'jpg-to-pdf': return jpgToPdf();
            case 'watermark': return addWatermark();
            case 'page-numbers': return addPageNumbers();
            case 'protect': return protectPdf();
        }
    };

    const tool = TOOLS.find(t => t.id === activeTool);
    const acceptType = activeTool === 'jpg-to-pdf' ? 'image/jpeg,image/png,image/webp' : '.pdf';
    const multiFile = activeTool === 'merge' || activeTool === 'jpg-to-pdf';

    /* ─── TOOL GRID ─── */
    if (!activeTool) {
        return (
            <div>
                <h1 className="text-2xl font-heading font-bold text-ig-text dark:text-ig-text-light mb-1">PDF Tools</h1>
                <p className="text-sm text-ig-text-2 mb-6">Every tool you need to work with PDFs — all free, right in your browser.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {TOOLS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTool(t.id)}
                            className="card p-5 text-left hover:shadow-ig transition-all group"
                        >
                            <div className={`w-10 h-10 ${t.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                <t.icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="font-semibold text-sm text-ig-text dark:text-ig-text-light">{t.label}</p>
                            <p className="text-xs text-ig-text-2 mt-0.5">{t.desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    /* ─── ACTIVE TOOL UI ─── */
    return (
        <div>
            <button onClick={resetTool} className="flex items-center gap-1 text-ig-primary text-sm font-semibold mb-4 hover:opacity-70">
                ← Back to all tools
            </button>

            <div className="card p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 ${tool.color} rounded-xl flex items-center justify-center`}>
                        <tool.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-ig-text dark:text-ig-text-light">{tool.label}</h2>
                        <p className="text-xs text-ig-text-2">{tool.desc}</p>
                    </div>
                </div>

                {/* File drop zone */}
                <div
                    className="border-2 border-dashed border-ig-separator dark:border-ig-separator-dark rounded-xl p-8 text-center hover:border-ig-primary transition-colors cursor-pointer mb-4"
                    onClick={() => fileRef.current?.click()}
                >
                    <HiUpload className="w-8 h-8 text-ig-text-2 mx-auto mb-2" />
                    <p className="text-sm text-ig-text-2 mb-1">
                        {activeTool === 'jpg-to-pdf' ? 'Select images (JPG, PNG)' : 'Select PDF file(s)'}
                    </p>
                    <p className="text-xs text-ig-text-2">Click here or drag and drop</p>
                    <input
                        ref={fileRef}
                        type="file"
                        accept={acceptType}
                        multiple={multiFile}
                        onChange={handleFiles}
                        className="hidden"
                    />
                </div>

                {/* File list */}
                {files.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                        {files.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 bg-ig-bg-2 dark:bg-ig-bg-elevated rounded-lg p-2.5">
                                <span className="text-lg">{activeTool === 'jpg-to-pdf' ? '🖼️' : '📄'}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate text-ig-text dark:text-ig-text-light">{f.name}</p>
                                    <p className="text-[10px] text-ig-text-2">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button onClick={() => removeFile(i)} className="text-ig-text-2 hover:text-ig-error"><HiX className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Extra inputs */}
                {activeTool === 'split' && (
                    <div className="mb-4">
                        <label className="text-xs font-semibold text-ig-text dark:text-ig-text-light block mb-1">Pages to extract</label>
                        <input
                            className="input-field text-sm"
                            placeholder="e.g. 1-3 or 1,3,5 or 2-5,8"
                            value={extraInput}
                            onChange={e => setExtraInput(e.target.value)}
                        />
                    </div>
                )}

                {activeTool === 'rotate' && (
                    <div className="mb-4 flex items-center gap-3">
                        <label className="text-xs font-semibold text-ig-text dark:text-ig-text-light">Rotation:</label>
                        {[90, 180, 270].map(a => (
                            <button
                                key={a}
                                onClick={() => setRotateAngle(a)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${rotateAngle === a ? 'bg-ig-primary text-white' : 'bg-ig-bg-2 dark:bg-ig-bg-elevated text-ig-text-2'
                                    }`}
                            >
                                {a}°
                            </button>
                        ))}
                    </div>
                )}

                {activeTool === 'watermark' && (
                    <div className="mb-4">
                        <label className="text-xs font-semibold text-ig-text dark:text-ig-text-light block mb-1">Watermark text</label>
                        <input
                            className="input-field text-sm"
                            placeholder="e.g. CONFIDENTIAL, DRAFT"
                            value={extraInput}
                            onChange={e => setExtraInput(e.target.value)}
                        />
                    </div>
                )}

                {activeTool === 'protect' && (
                    <div className="mb-4">
                        <label className="text-xs font-semibold text-ig-text dark:text-ig-text-light block mb-1">Password</label>
                        <input
                            type="password"
                            className="input-field text-sm"
                            placeholder="Enter password"
                            value={extraInput}
                            onChange={e => setExtraInput(e.target.value)}
                        />
                    </div>
                )}

                {/* Process button */}
                <button onClick={runTool} disabled={processing} className="btn-primary w-full py-3 text-sm">
                    {processing ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                        </span>
                    ) : (
                        `${tool.label} →`
                    )}
                </button>
            </div>
        </div>
    );
}
