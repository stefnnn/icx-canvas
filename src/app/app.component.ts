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

type CanvasTabId = "empty" | "image1" | "image2";

interface CanvasTab {
  id: CanvasTabId;
  label: string;
  src?: string;
  width: number;
  height: number;
}

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
  @ViewChild("boardViewport", { read: ElementRef }) boardViewport?: ElementRef<HTMLElement>;
  readonly tabs: CanvasTab[] = [
    { id: "empty", label: "Empty", width: 800, height: 500 },
    { id: "image1", label: "Image 1", src: "assets/images/image_1.png", width: 714, height: 862 },
    { id: "image2", label: "Image 2", src: "assets/images/image_2.png", width: 960, height: 988 },
  ];
  readonly colors = ["#20252d", "#ff6b5f", "#f6b73c", "#35bfa3", "#4d7cff"];
  readonly tools: ToolbarToolDefinition[] = [
    { id: "select", label: "Select", icon: "select" },
    { id: "freehand", label: "Freehand", icon: "pencil" },
    { id: "square", label: "Square", icon: "square" },
    { id: "circle", label: "Circle", icon: "circle" },
    { id: "line", label: "Line", icon: "line" },
    { id: "arrow", label: "Arrow", icon: "arrow" },
    { id: "text", label: "Text", icon: "text" },
    { id: "erase", label: "Eraser", icon: "eraser" },
    { id: "undo", label: "Undo", icon: "undo" },
    { id: "clear", label: "Clear all", icon: "trash" },
  ];
  selectedColor = this.colors[0];
  selectedTool: ToolbarTool = "freehand";
  activeTool = ToolType.Pen;
  colorsOpen = false;
  activeTabId: CanvasTabId = "empty";
  dataByTab: Partial<Record<CanvasTabId, WhiteboardElement[]>> = {};
  config: Partial<WhiteboardConfig> = {
    canvasWidth: 800,
    canvasHeight: 500,
    fullScreen: false,
    center: false,
    backgroundColor: "transparent",
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
    window.addEventListener("keydown", this.deleteSelectedOnKeyDown, { capture: true });
    this.whiteboardService.setActiveBoard(this.boardIdFor(this.activeTabId));
    const saved = localStorage.getItem("canvas-studio-elements");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as WhiteboardElement[] | Partial<Record<CanvasTabId, WhiteboardElement[]>>;
        // Keep existing saved drawings in the empty board when upgrading from the single-board version.
        this.dataByTab = Array.isArray(parsed) ? { empty: parsed } : parsed;
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
    window.removeEventListener("keydown", this.deleteSelectedOnKeyDown, { capture: true });
  }

  private readonly deleteSelectedOnKeyDown = (event: KeyboardEvent): void => {
    if (!["Delete", "Backspace"].includes(event.key)) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const activeElement = document.activeElement as HTMLElement | null;
    const isTextInput = (element: HTMLElement | null): boolean =>
      element?.tagName === "INPUT" || element?.tagName === "TEXTAREA" || element?.isContentEditable === true;
    if (isTextInput(target) || isTextInput(activeElement)) {
      return;
    }

    if (this.whiteboardService.getSelectedElements().length === 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.whiteboardService.deleteSelectedElements();
  };

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

  get activeTab(): CanvasTab {
    return this.tabs.find((tab) => tab.id === this.activeTabId) ?? this.tabs[0];
  }

  selectTab(tab: CanvasTab): void {
    if (tab.id === this.activeTabId) {
      return;
    }

    this.activeTabId = tab.id;
    this.whiteboardService.setActiveBoard(this.boardIdFor(tab.id));
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
      select: ToolType.Select,
      freehand: ToolType.Pen,
      square: ToolType.Rectangle,
      circle: ToolType.Ellipse,
      line: ToolType.Line,
      arrow: ToolType.Arrow,
      text: ToolType.Text,
      erase: ToolType.Eraser,
    };
    this.activeTool = toolMap[tool];
    this.whiteboardService.setActiveTool(toolMap[tool]);
  }

  boardConfig(tab: CanvasTab): Partial<WhiteboardConfig> {
    return {
      ...this.config,
      canvasWidth: tab.width,
      canvasHeight: tab.height,
      backgroundColor: "transparent",
    };
  }

  boardIdFor(tabId: CanvasTabId): string {
    return `canvas-studio-${tabId}`;
  }

  persist(tabId: CanvasTabId, elements: WhiteboardElement[]): void {
    this.dataByTab[tabId] = elements;
    const saved = this.readSavedData();
    saved[tabId] = elements;
    localStorage.setItem("canvas-studio-elements", JSON.stringify(saved));
  }

  getStoredData(tabId: CanvasTabId): WhiteboardElement[] {
    const saved = this.readSavedData();
    return this.dataByTab[tabId] ?? saved[tabId] ?? [];
  }

  private readSavedData(): Partial<Record<CanvasTabId, WhiteboardElement[]>> {
    const saved = localStorage.getItem("canvas-studio-elements");
    if (!saved) {
      return this.dataByTab;
    }

    try {
      const parsed = JSON.parse(saved) as WhiteboardElement[] | Partial<Record<CanvasTabId, WhiteboardElement[]>>;
      return Array.isArray(parsed) ? { empty: parsed } : parsed;
    } catch {
      return { empty: [] };
    }
  }
}
