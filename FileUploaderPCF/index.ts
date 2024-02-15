import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class FileUploaderPCF implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _state: ComponentFramework.Dictionary;
    private _notifyOutputChanged: () => void;
    
    private _isInitialized: boolean = false;
    private _dropZone: HTMLDivElement;
    private _fileInput: HTMLInputElement;
    private _infoText: HTMLParagraphElement;
    private _iconImage: HTMLImageElement;

    // inputs
    private _control: string;
    private _imageUrl: string;
    private _label: string;

    // outputs
    private _status: string;
    private _base64: string;
    private _base64DataUrl: string;

    /**
     * Empty constructor.
     */
    constructor() {}

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        // Add control initialization code
        this._container = container;
        this._context = context;
        this._state = state;
        this._notifyOutputChanged = notifyOutputChanged;

        // handle rezize event
        this._context.mode.trackContainerResize(true);
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        // update the context
        this._context = context;

        // Get the control parameters
        const width = this._context.mode.allocatedWidth || 256;
        const height = this._context.mode.allocatedHeight || 256;
        this._label = this._context.parameters.label.raw || "Drop a file here";
        this._imageUrl = this._context.parameters.imageUrl.raw || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAyNCcgaGVpZ2h0PScxMDI0JyB2aWV3Qm94PScwIDAgMTAyNCAxMDI0JyBmaWxsPSdub25lJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPiA8cGF0aCBkPSdNMTEyIDU5MVY3NTFDMTEyIDc2OC42NzMgMTI2LjMyNyA3ODMgMTQ0IDc4M0g4ODBDODk3LjY3MyA3ODMgOTEyIDc2OC42NzMgOTEyIDc1MVY1OTEnIHN0cm9rZT0nI0MwQzBDMCcgc3Ryb2tlLXdpZHRoPSc2NCcgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJy8+IDxyZWN0IHg9JzQ0OCcgeT0nNDk1JyB3aWR0aD0nMTI4JyBoZWlnaHQ9JzE2MCcgcng9JzE2JyBmaWxsPScjQzBDMEMwJy8+IDxwYXRoIGQ9J000OTguMjgyIDI2My44NTFDNTA0LjQ5NyAyNTMuNDk4IDUxOS41MDMgMjUzLjQ5OCA1MjUuNzE4IDI2My44NTFMNjU1LjkzNCA0ODAuNzY1QzY2Mi4zMzYgNDkxLjQyOSA2NTQuNjU0IDUwNSA2NDIuMjE2IDUwNUgzODEuNzg0QzM2OS4zNDYgNTA1IDM2MS42NjQgNDkxLjQyOSAzNjguMDY2IDQ4MC43NjVMNDk4LjI4MiAyNjMuODUxWicgZmlsbD0nI0MwQzBDMCcvPiA8L3N2Zz4=";
        this._control = this._context.parameters.control.raw || "";

        // Add code to update control view
        if(!this._isInitialized) {           
            this._dropZone = document.createElement('div');
            this._dropZone.style.cssText = `
                border: 2px dashed #ccc;
                border-radius: 16px;
                width: ${width}px;
                height: ${height}px;
                padding: 0;
                text-align: center;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 10px;
                font-family: Arial, sans-serif;
                color: #ccc;
                cursor: pointer;
            `;
    
            // Image Element
            this._iconImage = document.createElement('img');
            this._iconImage.src = this._imageUrl;
            this._iconImage.alt = 'Upload Icon';
            this._iconImage.style.width = '48px'; // Customize as needed
            this._iconImage.style.height = '48px'; // Customize as needed
    
            // Text Element
            this._infoText = document.createElement('p');
            this._infoText.textContent = this._label;
            this._infoText.style.margin = '0';
            this._infoText.style.fontSize = '12px'; // Customize as needed
       
            // Append elements to drop zone
            this._dropZone.appendChild(this._iconImage);
            this._dropZone.appendChild(this._infoText);

            // add the hover effect on enter
            this._dropZone.addEventListener('mouseenter', () => {
                this._dropZone.style.border = '2px dashed #888';
                this._dropZone.style.color = '#888';
            });
            // remove the hover effect on leave
            this._dropZone.addEventListener('mouseleave', () => {
                this._dropZone.style.border = '2px dashed #ccc';
                this._dropZone.style.color = '#ccc';
            });

            // dragover event
            this._dropZone.addEventListener('dragover', (event) => {
                event.preventDefault();
                this._dropZone.style.borderColor = 'orange';
            });

            // Prevent default behavior for dragleave and drop
            this._dropZone.addEventListener('dragleave', (event) => {
                event.preventDefault();
                this._dropZone.style.borderColor = '#ccc';
            });
    
            this._dropZone.addEventListener('drop', (event) => {
                event.preventDefault();
                this._dropZone.style.borderColor = '#ccc'; // Revert border color after drop
                this.handleDrop(event);
            });

            // Create hidden file input
            this._fileInput = document.createElement('input');
            this._fileInput.type = 'file';
            this._fileInput.hidden = true;

            // Listen for file selection
            this._fileInput.addEventListener('change', (event) => this.handleFileSelection(event));

            // Append elements to parent
            this._container.appendChild(this._dropZone);
            this._container.appendChild(this._fileInput);

            // Open file dialog when drop zone is clicked
            this._dropZone.addEventListener('click', () => this._fileInput.click());

            //update the initialized state
            this._isInitialized = true;
        } else {
            // Update the component's size and parameters
            this._dropZone.style.width = `${width}px`;
            this._dropZone.style.height = `${height}px`;
            this._infoText.textContent = this._label;
            this._iconImage.src = this._imageUrl;
        }

        //check for a ronnie reset
        if(this._control === "reset") {
            this.ronnieReset();
        }
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        console.log(`getOutputs() Called.`)
        return {
            "base64DataUrl": this._base64DataUrl,
            "base64": this._base64,
            "control": this._control
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        // Add code to cleanup control if necessary
    }

    private handleDrop(event: DragEvent): void {
        event.preventDefault();
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            this.readFileAsBase64(files[0]);
        }
        this._dropZone.style.borderColor = '#ccc'; // Revert border color after drop
    }

    private handleFileSelection(event: Event): void {
        const files = (event.target as HTMLInputElement).files;
        if (files && files.length > 0) {
            this.readFileAsBase64(files[0]);
        }
    }

    private readFileAsBase64(file: File): void {
        const reader = new FileReader();
        reader.onloadend = () => {
            this._base64DataUrl = reader.result as string;
            this._base64 = this.removeDataURIScheme(this._base64DataUrl);
            this._notifyOutputChanged();
            console.log(`notifyOutputChanged() Called.`);
        };
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            this.ronnieReset();
        };
        reader.readAsDataURL(file);
    }

    private removeDataURIScheme(dataURI: string) {
        const dataURIPattern = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+)?;base64,/;
        return dataURI.replace(dataURIPattern, '');
    }

    private ronnieReset() {
        this._base64 = "";
        this._base64DataUrl = "";
        this._control = "";
        this._notifyOutputChanged();
        console.log(`ronnieReset:notifyOutputChanged() Called.`);
    }
}