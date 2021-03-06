/**
 * A React component to view a PDF document
 *
 * @see https://react-pdf-viewer.dev
 * @license https://react-pdf-viewer.dev/license
 * @copyright 2019-2020 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import React, { useEffect, useState } from 'react';

import File from './File';
import Slot from './layouts/Slot';
import defaultLayout from './layouts/defaultLayout';
import defaultToolbar from './layouts/defaultToolbar';
import Inner from './layouts/Inner';
import { Layout } from './layouts/Layout';
import PageSize from './layouts/PageSize'; 
import PageSizeCalculator from './layouts/PageSizeCalculator';
import { RenderPage } from './layouts/RenderPage';
import { RenderToolbar } from './layouts/ToolbarSlot';
import DocumentLoader, { RenderError } from './loader/DocumentLoader';
import LocalizationMap from './localization/LocalizationMap';
import LocalizationProvider from './localization/LocalizationProvider';
import ScrollMode from './ScrollMode';
import SelectionMode from './SelectionMode';
import SpecialZoomLevel from './SpecialZoomLevel';
import ThemeProvider from './theme/ThemeProvider';
import PdfJs from './vendors/PdfJs';
import { Plugin } from './types/Plugin';

export interface CanvasLayerRenderEvent {
    ele: HTMLCanvasElement;
    pageIndex: number;
    rotation: number;
    scale: number;
}
export interface DocumentLoadEvent {
    doc: PdfJs.PdfDocument;
}
export interface PageChangeEvent {
    currentPage: number;
    doc: PdfJs.PdfDocument;
}
export interface TextLayerRenderEvent {
    ele: HTMLElement;
}
export interface ZoomEvent {
    doc: PdfJs.PdfDocument;
    scale: number;
}

export interface CharacterMap {
    isCompressed: boolean;
    url: string;
}

export interface Cors {
    withCredentials: boolean;
    httpHeaders: string;
}

interface ViewerProps {
    characterMap?: CharacterMap;
    cors?: Cors;
    // The default zoom level
    // If it's not set, the initial zoom level will be calculated based on the dimesion of page and the container width
    defaultScale?: number | SpecialZoomLevel;
    fileUrl: string | Uint8Array;
    // The page (zero-index based) that will be displayed initially
    initialPage?: number;
    // The keyword that will be highlighted in all pages
    keyword?: string | RegExp;
    // Plugins
    plugins?: Plugin[];
    localization?: LocalizationMap;
    // The prefix for CSS classes
    prefixClass?: string;
    renderError?: RenderError;
    renderPage?: RenderPage;
    // The text selection mode
    selectionMode?: SelectionMode;
    onCanvasLayerRender?(e: CanvasLayerRenderEvent): void;
    onDocumentLoad?(e: DocumentLoadEvent): void;
    onPageChange?(e: PageChangeEvent): void;
    // Invoked when the text layer is ready
    onTextLayerRender?(e: TextLayerRenderEvent): void;
    onZoom?(e: ZoomEvent): void;
}

const Viewer: React.FC<ViewerProps> = ({
    characterMap,
    cors,
    defaultScale,
    fileUrl,
    initialPage = 0,
    keyword,
    localization,
    plugins = [],
    prefixClass,
    renderError,
    renderPage,
    selectionMode = SelectionMode.Text,
    onCanvasLayerRender = () => {/**/},
    onDocumentLoad = () => {/**/},
    onPageChange = () => {/**/},
    onTextLayerRender = () => {/**/},
    onZoom = () => {/**/},
}) => {
    const [file, setFile] = useState<File>({
        data: fileUrl,
        name: (typeof fileUrl === 'string') ? fileUrl : '',
    });

    const openFile = (fileName: string, data: Uint8Array) => {
        setFile({
            data,
            name: fileName,
        });
    };

    useEffect(() => {
        setFile({
            data: fileUrl,
            name: (typeof fileUrl === 'string') ? fileUrl : '',
        });
    }, [fileUrl]);

    return (
        <ThemeProvider prefixClass={prefixClass}>
            <LocalizationProvider localization={localization}>
                {(_) => (
                    <DocumentLoader
                        characterMap={characterMap}
                        cors={cors}
                        file={file.data}
                        render={(doc: PdfJs.PdfDocument) => (
                            <PageSizeCalculator
                                doc={doc}
                                render={(ps: PageSize) => (
                                    <Inner
                                        defaultScale={defaultScale}
                                        doc={doc}
                                        file={file}
                                        initialPage={initialPage}
                                        keyword={keyword}
                                        pageSize={ps}
                                        plugins={plugins}
                                        renderPage={renderPage}
                                        selectionMode={selectionMode}
                                        viewerState={{
                                            file,
                                            pageIndex: initialPage,
                                            scale: defaultScale || ps.scale,
                                        }}
                                        onCanvasLayerRender={onCanvasLayerRender}
                                        onDocumentLoad={onDocumentLoad}
                                        onOpenFile={openFile}
                                        onPageChange={onPageChange}
                                        onTextLayerRender={onTextLayerRender}
                                        onZoom={onZoom}
                                    />
                                )}
                            />
                        )}
                        renderError={renderError}
                    />
                )}
            </LocalizationProvider>
        </ThemeProvider>
    );
};

export default Viewer;
