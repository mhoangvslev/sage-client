import Spy from './spy';
/**
 * An HTTP request sent to the SaGe server,
 * according to the SaGe extended SPARQL query protocol.
 * @author Thomas Minier
 */
export interface SageQueryBody {
    query: string;
    defaultGraph: string;
    next: string | null;
}
/**
 * An HTTP response recevied from the SaGe server,
 * according to the SaGe extended SPARQL query protocol.
 * @author Thomas Minier
 */
export interface SageResponseBody {
    bindings: string[];
    next: string | null;
    hasNext: boolean;
}
/**
 * An HTTP client used to query a SaGe server using the SPARQL query protocol
 * @author Thomas Minier
 */
export declare class SageRequestClient {
    private readonly _url;
    private readonly _httpClient;
    private readonly _spy;
    private readonly _retryDelay;
    private readonly _maxAttemps;
    private _isClosed;
    /**
     * Constructor
     * @param {string} url - URL of the Sage server to use
     * @param {Spy} [spy=null] - SPy used to gather metadata about query execution
     */
    constructor(url: string, spy?: Spy);
    /**
     * Open the HTTP client, allowing the execution of HTTP requests
     */
    open(): void;
    /**
     * Close the HTTP client, preventing the execution of more HTTP requests
     */
    close(): void;
    /**
     * Send a SPARQL query to the SaGe server using an HTTP request
     * @param  query        - SPARQL query to execute
     * @param  defaultGraph - Default Graph IRI
     * @param  next         - (optional) Next link
     * @return The HTTP response as sent by the SaGe server
     */
    query(query: string, defaultGraph: string, next?: string | null): Promise<SageResponseBody>;
}
