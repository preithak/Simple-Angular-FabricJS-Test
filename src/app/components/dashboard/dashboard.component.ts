import { Component, OnInit, NgZone, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from "../../shared/services/auth.service";
import { Router } from "@angular/router";
import { fabric } from 'fabric';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  constructor(
    public authService: AuthService,
    public router: Router,
    public ngZone: NgZone
  ) { }

  canvas: any;
  color = '#000000';
  currentMode: String;
  modes = {
    drawing: 'draw'
  }
  id = 'canvas';

  ngOnInit() {
    
  }

  ngAfterViewInit(){
    this.canvas = this.initCanvas(this.id, this.myIdentifier.nativeElement.offsetWidth, this.myIdentifier.nativeElement.offsetHeight);

    this.canvas.loadFromJSON(this.getUserData());

    this.canvas.on('after:render', (event) =>{
      this.authService.updateUserData(JSON.stringify(this.canvas)); 
    
    });

  }

  getUserData(){
    return JSON.parse(localStorage.getItem('canvas'));
  }

  initCanvas(id, width, height){
    return new fabric.Canvas(id, 
    {
      width: width,
      height:height,
    });
  }

  toggleModes(){
    this.canvas.isDrawingMode = false;

    if(this.currentMode === this.modes.drawing){
      this.currentMode = ''
      this.canvas.isDrawingMode = false;
    } else {
      this.canvas.freeDrawingBrush.width = 5;
      this.currentMode = this.modes.drawing;
      this.canvas.isDrawingMode = true;
    }
  
  }

  onChangeColor(color){
    this.canvas.freeDrawingBrush.color = color;
  }

  clearCanvas() {
    this.canvas.clear();
  }

  @ViewChild('myIdentifier')
  myIdentifier: ElementRef;

} 