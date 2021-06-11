import { menuManager } from "../../client";
import { Submenu } from "./submenu";

export class Menu {
    public name: string;
    public resource: string;
    public position: string;
    public handle: string;

    constructor(menuName: string, menuResource: string, menuPosition: string = "top-left") {
        this.name = menuName;
        this.resource = menuResource;
        this.position = menuPosition;
        this.handle = menuManager.AddMenu(menuName, menuResource, menuPosition);
    }

    // Get Requests
    public get GetName(): string {
        return this.name;
    }

    public get GetPosition(): string {
        return this.position;
    }

    public get GetHandle(): string {
        return this.handle
    }

    // Methods
    public async IsAnyMenuOpen(): Promise<boolean> {
        return menuManager.IsAnyMenuOpen();
    }

    public Open(): void {
        menuManager.Open(this.handle);
    }

    public async Close(): Promise<void> {
        menuManager.Close();
    }

    public Button(buttonName: string, buttonCallback: CallableFunction): void {
        menuManager.AddButton(buttonName, this, buttonCallback, this.resource);
    }

    public List(listName: string, listContents: any[], listCallback: CallableFunction): void {
        menuManager.AddList(listName, listContents, this, listCallback, this.resource);
    }

    public Checkbox(checkboxName: string, checkboxState: boolean, checkboxCallback: CallableFunction): string {
        return menuManager.AddCheckbox(checkboxName, checkboxState, this, checkboxCallback, this.resource);
    }

    public Submenu(menuName: string): Submenu {
        return new Submenu(menuName, this);
    }

    public Clear(): void {
        menuManager.ClearMenu(this);
    }
}