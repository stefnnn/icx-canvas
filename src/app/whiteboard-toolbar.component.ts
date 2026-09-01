import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent, IconName } from "./icon.component";

export type ToolbarTool = "select" | "freehand" | "square" | "circle" | "line" | "arrow" | "text" | "erase" | "undo" | "clear";
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
  shapesOpen = false;

  private readonly shapeToolIds: ToolbarTool[] = ["square", "circle", "line", "arrow"];

  get shapeTools(): ToolbarToolDefinition[] {
    return this.tools.filter((tool) => this.shapeToolIds.includes(tool.id));
  }

  get standaloneTools(): ToolbarToolDefinition[] {
    return this.tools.filter(
      (tool) => !this.shapeToolIds.includes(tool.id) && tool.id !== "select" && tool.id !== "freehand",
    );
  }

  get selectToolDefinition(): ToolbarToolDefinition | undefined {
    return this.tools.find((tool) => tool.id === "select");
  }

  get freehandToolDefinition(): ToolbarToolDefinition | undefined {
    return this.tools.find((tool) => tool.id === "freehand");
  }

  isShapeToolSelected(): boolean {
    return this.shapeToolIds.includes(this.selectedTool);
  }

  toggleColors(): void {
    this.colorsOpen = !this.colorsOpen;
    if (this.colorsOpen) {
      this.shapesOpen = false;
    }
  }

  toggleShapes(): void {
    this.shapesOpen = !this.shapesOpen;
    if (this.shapesOpen) {
      this.colorsOpen = false;
    }
  }

  selectColor(color: string): void {
    this.colorsOpen = false;
    this.colorSelected.emit(color);
  }
  selectTool(tool: ToolbarTool): void {
    this.shapesOpen = false;
    this.colorsOpen = false;
    this.toolSelected.emit(tool);
  }
}
