import { Component, OnInit, ViewEncapsulation, AfterViewChecked,  AfterViewInit} from '@angular/core';
import { AppService } from './app.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
providers: [AppService]
})
export class AppComponent implements OnInit, AfterViewInit, AfterViewChecked{
  title = 'Demoapp';
constructor( private appService: AppService,){}
public images = new Array();

public getData() {
  let t1 = 'test';
  this.appService.fetchData(t1).subscribe(
        (res) => {
    for(let i =0;i<res.length;i++){
      if(this.checkImage(res[i])){
        this.images.push(res[i]);
      }
    }
      }, (err) => {
        console.log(err);
      });
}

public refresh(){
  this.images=null;
  this.getData();
}

public checkImage(data: any) {
  let tmp = data.split('.');
    console.log('check ',tmp);
  if(tmp[tmp.length-1] === 'jpg' || tmp[tmp.length-1] === 'jpeg') {
    return true;
  }else {
  return false;
}
}

public urlAppend(data: any):any {
  return 'http://localhost:3000/imgfile/?image='+data;
}

public ngAfterViewInit() {
   this.getData();
}

public ngOnInit() {}
public ngAfterViewChecked(): void {}

}
