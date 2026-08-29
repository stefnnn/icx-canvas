import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import {
  NgWhiteboardComponent,
  NgWhiteboardService,
  ToolType,
  WhiteboardConfig,
  WhiteboardElement,
} from "ng-whiteboard";
import { IconComponent } from "./icon.component";
import { ToolbarTool, ToolbarToolDefinition, WhiteboardToolbarComponent } from "./whiteboard-toolbar.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, IconComponent, NgWhiteboardComponent, WhiteboardToolbarComponent],
  providers: [NgWhiteboardService],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild("board") board?: NgWhiteboardComponent;
  @ViewChild("boardViewport", { read: ElementRef }) boardViewport?: ElementRef<HTMLElement>;
  readonly boardId = "canvas-studio-board";
  readonly colors = ["#20252d", "#ff6b5f", "#f6b73c", "#35bfa3", "#4d7cff"];
  readonly tools: ToolbarToolDefinition[] = [
    { id: "freehand", label: "Freehand", icon: "pencil" },
    { id: "square", label: "Square", icon: "square" },
    { id: "circle", label: "Circle", icon: "circle" },
    { id: "arrow", label: "Arrow", icon: "arrow" },
    { id: "erase", label: "Eraser", icon: "eraser" },
    { id: "undo", label: "Undo", icon: "undo" },
    { id: "clear", label: "Clear all", icon: "trash" },
  ];
  selectedColor = this.colors[0];
  selectedTool: ToolbarTool = "freehand";
  activeTool = ToolType.Pen;
  colorsOpen = false;
  data: WhiteboardElement[] = [];
  config: Partial<WhiteboardConfig> = {
    canvasWidth: 800,
    canvasHeight: 600,
    fullScreen: false,
    center: false,
    backgroundColor: "#ffffff",
    strokeColor: this.selectedColor,
    strokeWidth: 4,
    fill: "transparent",
    drawingEnabled: true,
    // Keep the viewport at its default position. The event guard below disables viewport gestures.
    zoom: 1,
    x: 0,
    y: 0,
    keyboardShortcutsEnabled: false,
    selectAfterDraw: false,
    arrowConfig: { startHeadStyle: "none", endHeadStyle: "open-arrow", lineStyle: "straight" },
  };

  constructor(
    private readonly whiteboardService: NgWhiteboardService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.boardViewport?.nativeElement.addEventListener("wheel", this.blockViewportGesture, { capture: true });
    this.boardViewport?.nativeElement.addEventListener("pointerdown", this.blockViewportGesture, { capture: true });
    this.boardViewport?.nativeElement.addEventListener("keydown", this.blockViewportGesture, { capture: true });
    this.boardViewport?.nativeElement.addEventListener("keyup", this.blockViewportGesture, { capture: true });
    this.whiteboardService.setActiveBoard(this.boardId);
    const saved = localStorage.getItem("canvas-studio-elements");
    if (saved) {
      try {
        this.data = JSON.parse(saved) as WhiteboardElement[];
      } catch {
        localStorage.removeItem("canvas-studio-elements");
      }
    }
    this.changeDetector.markForCheck();
  }

  ngOnDestroy(): void {
    this.boardViewport?.nativeElement.removeEventListener("wheel", this.blockViewportGesture, { capture: true });
    this.boardViewport?.nativeElement.removeEventListener("pointerdown", this.blockViewportGesture, { capture: true });
    this.boardViewport?.nativeElement.removeEventListener("keydown", this.blockViewportGesture, { capture: true });
    this.boardViewport?.nativeElement.removeEventListener("keyup", this.blockViewportGesture, { capture: true });
  }

  private readonly blockViewportGesture = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    if (!target?.closest("ng-whiteboard")) {
      return;
    }

    if (event.type === "wheel") {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (event.type === "pointerdown") {
      const pointerEvent = event as PointerEvent;
      if (pointerEvent.button === 1) {
        event.stopPropagation();
      }
      return;
    }

    const keyboardEvent = event as KeyboardEvent;
    const isSpacePan = keyboardEvent.code === "Space";
    const isZoomShortcut =
      (keyboardEvent.ctrlKey || keyboardEvent.metaKey) &&
      ["Equal", "NumpadAdd", "Minus", "NumpadSubtract", "Digit0", "Numpad0"].includes(keyboardEvent.code);
    if (isSpacePan || isZoomShortcut) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  chooseColor(color: string): void {
    this.selectedColor = color;
    this.colorsOpen = false;
    this.config = { ...this.config, strokeColor: color };
    this.whiteboardService.updateConfig({ strokeColor: color });
  }

  chooseTool(tool: ToolbarTool): void {
    this.selectedTool = tool;
    if (tool === "undo") {
      this.whiteboardService.undo();
      return;
    }
    if (tool === "clear") {
      this.whiteboardService.clear();
      return;
    }
    const toolMap: Record<Exclude<ToolbarTool, "undo" | "clear">, ToolType> = {
      freehand: ToolType.Pen,
      square: ToolType.Rectangle,
      circle: ToolType.Ellipse,
      arrow: ToolType.Arrow,
      erase: ToolType.Eraser,
    };
    this.activeTool = toolMap[tool];
    this.whiteboardService.setActiveTool(toolMap[tool]);
  }

  persist(elements: WhiteboardElement[]): void {
    this.data = elements;
    localStorage.setItem("canvas-studio-elements", JSON.stringify(elements));
  }
}
