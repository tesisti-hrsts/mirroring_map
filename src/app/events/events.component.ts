import { AfterViewInit, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Message } from '@stomp/stompjs';
import { Feature, Map, View } from 'ol';
import { Zoom } from 'ol/control.js';
import { Point } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import Vector from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import { XYZ } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { DialogComponent } from '../dialog/dialog.component';
import { LegendComponent } from '../legend/legend.component';
import { RxStompService } from '../rx-stomp.service';
import { CloseDialogEvent, EventTypes, LegendEvent, MoveEvent, PointEvent, PointerEvent, RemovePointerEvent } from '../types/types';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements AfterViewInit {
  private topicSubscription!: Subscription;
  private center = fromLonLat([8.902184, 44.414165]);
  private map!: Map;
  private iconLocation = fromLonLat([8.969910967086902, 44.402153644447964])
  private clientId = uuidv4();
  private videowall = false;
  private markerIcon = '/../assets/img/neon-circle-60.png';
  private indicator_visibility = false;
  private iconIndicator = new Feature({
    geometry: new Point(this.center)
  });
  private indicatorLayer = new Vector({
    source: new VectorSource({
      features: [this.iconIndicator]
    })
  });

  constructor(private rxStompService: RxStompService, public dialog: MatDialog, public legend: LegendComponent) {
    var url = new URL(window.location.href);
    var param = url.searchParams.get("videowall");
    if (param === "true") this.videowall = true;
    else this.videowall = false;
  }

  private openDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '200px'
    });

    dialogRef.afterClosed().subscribe(result => {
      const newEvent: CloseDialogEvent = {
        type: EventTypes.CLOSE_DIALOG_EVENT,
        clientId: this.clientId,
        timestamp: new Date().getTime()
      }
      console.log(this.clientId);
      const newStringEvent = JSON.stringify(newEvent);
      this.rxStompService.publish({ destination: '/topic/events', body: newStringEvent });
    });
  }

  ngAfterViewInit(): void {
    if (this.videowall) this.legend.hideBtnLegend();

    const mapView = new View({
      center: [0, 0],
      projection: 'EPSG:3857',
      minZoom: 12,
      extent: [972832.7956102979, 5517817.196127409, 1009140.3840457567, 5541703.7674665265]
    });

    const layer = new TileLayer({
      source: new XYZ({
        url: 'http://localhost:8080/styles/dark-matter/{z}/{x}/{y}.png'
      })
    });

    this.map = new Map({
      layers: [layer],
      target: "map",
      view: mapView,
      controls: this.videowall ? [] : [new Zoom()]
    });

    const iconFeature = new Feature({
      geometry: new Point(this.iconLocation)
    });

    const popupLayer = new Vector({
      source: new VectorSource({
        features: [iconFeature]
      })
    });
    const iconStyle = new Style({
      image: new Icon({
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: '/../assets/img/icon_red_25.png',
      }),
    });
    iconFeature.setStyle(iconStyle);
    this.map.addLayer(popupLayer);

    const indicatorStyle = new Style({
      image: new Icon({
        anchor: [0.5, 30],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: this.markerIcon,
      }),
    });
    this.iconIndicator.setStyle(indicatorStyle);

    this.map.getView().setCenter(this.center);
    this.map.getView().setZoom(12);
    this.map.on('moveend', () => {
      if (!this.videowall) this.onMoveEnd()
    });

    this.map.on('click', evt => {
      const feature = this.map.forEachFeatureAtPixel(
        evt.pixel,
        (feature: unknown) => {
          return feature;
        }
      );

      if (feature === iconFeature) {
        console.log(this.videowall);
        if (!this.videowall) {
          this.openDialog();
          const newEvent: PointEvent = {
            type: EventTypes.POINT_EVENT,
            clientId: this.clientId,
            timestamp: new Date().getTime(),
          }
          console.log(this.clientId);
          const newStringEvent = JSON.stringify(newEvent);
          this.rxStompService.publish({ destination: '/topic/events', body: newStringEvent });
        }
      }
      if (feature !== iconFeature && !this.videowall) {
        this.iconIndicator.setGeometry(new Point(evt.coordinate));
        if (!this.indicator_visibility) {
          this.map.addLayer(this.indicatorLayer);
          this.indicator_visibility = true;
        }

        const pointerEvent: PointerEvent = {
          type: EventTypes.POINTER_EVENT,
          clientId: this.clientId,
          timestamp: new Date().getTime(),
          coordinates: evt.coordinate,
        }
        console.log(evt.coordinate);
        console.log(pointerEvent);
        const newStringEvent = JSON.stringify(pointerEvent);
        this.rxStompService.publish({ destination: '/topic/events', body: newStringEvent });
        this.showRemoveBtn();
      }
    });

    //right click to remove indicator
    this.map.getViewport().addEventListener('contextmenu', evt => {
      if (!this.videowall && this.indicator_visibility) {
        evt.preventDefault();
        this.removeIndicator();
      }
    });

    this.map.on('pointermove', evt => {
      const feature = this.map.forEachFeatureAtPixel(
        evt.pixel,
        (feature: unknown) => {
          return feature;
        }
      );
      if (feature === iconFeature)
        this.map.getTargetElement().style.cursor = 'pointer';
      else this.map.getTargetElement().style.cursor = 'default';
    });
  }

  hideRemoveBtn() {
    const rmv_btn = document.getElementById('btnIndicDiv');
    if (rmv_btn !== null) rmv_btn.style.display = 'none';
  }

  showRemoveBtn() {
    const rmv_btn = document.getElementById('btnIndicDiv');
    if (rmv_btn !== null) rmv_btn.style.display = 'block';
  }

  removeIndicator() {
    this.map.removeLayer(this.indicatorLayer);
    this.indicator_visibility = false;
    const removeIndicEvent: RemovePointerEvent = {
      type: EventTypes.REMOVE_POINTER_EVENT,
      clientId: this.clientId,
      timestamp: new Date().getTime(),
    }
    const newStringEvent = JSON.stringify(removeIndicEvent);
    this.rxStompService.publish({ destination: '/topic/events', body: newStringEvent });
    this.hideRemoveBtn();
  }

  synchLegendChange(isVisible: boolean) {
    if (!this.videowall) {
      const legendEvent: LegendEvent = {
        type: EventTypes.LEGEND_EVENT,
        clientId: this.clientId,
        timestamp: new Date().getTime(),
        visibility: isVisible,
      }
      const newStringEvent = JSON.stringify(legendEvent);
      this.rxStompService.publish({ destination: '/topic/events', body: newStringEvent });
    }
  }

  ngOnInit(): void {
    this.topicSubscription = this.rxStompService
      .watch('/topic/events')
      .subscribe((message: Message) => {
        const event = JSON.parse(message.body);
        if (this.map !== undefined && event.clientId !== this.clientId) {
          if (event.type === EventTypes.MOVE_EVENT) {
            this.map.getView().setCenter(event.center);
            this.map.getView().setZoom(event.zoomLevel);
          }
          if (event.type === EventTypes.POINT_EVENT) {
            this.openDialog();
          }
          if (event.type === EventTypes.CLOSE_DIALOG_EVENT) {
            this.dialog.closeAll();
          }
          if (event.type === EventTypes.LEGEND_EVENT) {
            this.legend.synch_visibility_legend(event.visibility);
          }
          if (event.type === EventTypes.POINTER_EVENT) {
            this.iconIndicator.setGeometry(new Point(event.coordinates));
            if (!this.indicator_visibility) {
              this.map.addLayer(this.indicatorLayer);
              this.indicator_visibility = true;
            }
          }
          if (event.type === EventTypes.REMOVE_POINTER_EVENT) {
            this.map.removeLayer(this.indicatorLayer);
            this.indicator_visibility = false;
            this.hideRemoveBtn();
          }
        }
      });
  }

  onMoveEnd() {
    if (this.map !== undefined) {
      const zoom = this.map.getView().getZoom();
      const center = this.map.getView().getCenter();
      const newEvent: MoveEvent = {
        type: EventTypes.MOVE_EVENT,
        clientId: this.clientId,
        timestamp: new Date().getTime(),
        zoomLevel: zoom,
        center: center
      }
      const newStringEvent = JSON.stringify(newEvent);
      this.rxStompService.publish({ destination: '/topic/events', body: newStringEvent });
    }
  }

  ngOnDestroy() {
    this.topicSubscription.unsubscribe();
  }
}
