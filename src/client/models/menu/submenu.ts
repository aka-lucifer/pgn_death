import { menuManager } from "../../client";
import { Menu } from "./menu";

export class Submenu {
    public name: string;
    public resource: string;
    public position: string;
    public handle: string;

    constructor(menuName: string, parentMenu: Menu) {
        this.name = menuName;
        this.resource = parentMenu.resource;
        this.position = parentMenu.position;
        this.handle = menuManager.AddSubMenu(menuName, parentMenu);
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