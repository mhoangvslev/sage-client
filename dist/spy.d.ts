/**
 * A Spy inspect SPARQL query execution to provide metadata after query evaluation
 * @author Thomas Minier
 */
export default class Spy {
    private _nbHttpCalls;
    private _transferSize;
    private _nbResults;
    private _responseTimes;
    private _overheads;
    private _importTimes;
    private _exportTimes;
    private _httpErrors;
    constructor();
    get nbHTTPCalls(): number;
    get transferSize(): number;
    get nbResults(): number;
    get httpErrors(): Array<Error>;
    get avgOverhead(): number;
    get avgImportTime(): number;
    get avgExportTime(): number;
    get avgResponseTime(): number;
    reportHTTPRequest(count?: number): void;
    reportHTTPTransferSize(bytes: number): void;
    reportHTTPError(err: Error): void;
    reportSolution(count?: number): void;
    reportHTTPResponseTime(time: number): void;
    reportOverhead(overhead: number): void;
    reportImportTime(importTime: number): void;
    reportExportTime(exportTime: number): void;
}
