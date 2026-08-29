import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent, IconName } from "./icon.component";

export type ToolbarTool = "freehand" | "square" | "circle" | "arrow" | "erase" | "undo" | "clear";
export interface ToolbarToolDefinition {
  id: ToolbarTool;
  label: string;
  icon: IconName;
}

@Component({
  selector: "app-whiteboard-toolbar",
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: "./whiteboard-toolbar.component.html",
  styleUrl: "./whiteboard-toolbar.component.css",
})
export class WhiteboardToolbarComponent {
  @Input({ required: true }) colors: string[] = [];
  @Input({ required: true }) selectedColor = "";
  @Input({ required: true }) tools: ToolbarToolDefinition[] = [];
  @Input({ required: true }) selectedTool: ToolbarTool = "freehand";
  @Output() colorSelected = new EventEmitter<string>();
  @Output() toolSelected = new EventEmitter<ToolbarTool>();
  colorsOpen = false;

  selectColor(color: string): void {
    this.colorsOpen = false;
    this.colorSelected.emit(color);
  }
  selectTool(tool: ToolbarTool): void {
    this.toolSelected.emit(tool);
  }
}
