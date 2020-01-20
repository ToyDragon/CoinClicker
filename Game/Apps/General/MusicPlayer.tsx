import * as ReactDom from "react-dom";
import * as React from "react";
import App from "../App";
import { AllIcons } from "../../Core/Icons";
import WebosWindow from "../../OS/Window";
import Popup from "../../OS/Popup";
import SliderWidget from "../../OS/Widgets/Slider";
import SelectionListWidget from "../../OS/Widgets/SelectionList";
import ButtonWidget from "../../OS/Widgets/Button";
import LabelWidget from "../../OS/Widgets/Label";

interface Events{}

interface TrackInfo{
    title: string,
    filename: string
}

export class MusicPlayerApp extends App<Events>{

    private deletePopup: Popup;
    private tracks: TrackInfo[];
    private lastTrack: number;
    private currentAudio: HTMLAudioElement;
    private volume: number;
    private trackSelect: React.RefObject<SelectionListWidget>;
    private volumeSlider: React.RefObject<SliderWidget>;
    private timestamp: React.RefObject<LabelWidget>;
    private songTitleLabel: React.RefObject<LabelWidget>;

    private updateTimestampTimer: NodeJS.Timeout;

    public constructor(){
        super();

        this.volume = 0.5;
        this.tracks = [
            {
                title: "A",
                filename: "dec182 - V3 Newest Version (Half Mixed & Mastered).mp3"
            },{
                title: "B",
                filename: "dec186 - 6V3 Newest Version.mp3"
            },{
                title: "C",
                filename: "dec1811 - 11V2 Newest Version.mp3"
            },{
                title: "D",
                filename: "dec1812 - 12.mp3"
            },{
                title: "E",
                filename: "dec184 - 4.mp3"
            },{
                title: "F",
                filename: "dec189 - 9.mp3"
            },{
                title: "G",
                filename: "dec195.mp3"
            },{
                title: "H",
                filename: "feb183.mp3"
            },{
                title: "I",
                filename: "feb185.mp3"
            },{
                title: "J",
                filename: "feb187V2.mp3"
            },{
                title: "K",
                filename: "jan191V2.mp3"
            },{
                title: "L",
                filename: "jan20fdsfsd2V2.mp3"
            },{
                title: "M",
                filename: "jan20hhhhhhhhhhhhV2.mp3"
            }
        ];
    }

    public CreateWindow(): void{
		this.windowObj = new WebosWindow({
			width: 360,
			height: 317,
			icon: AllIcons.Music,
			title: "Music Player"
        });
        
        this.windowObj.on("close", () => {
            if(this.deletePopup){
                this.deletePopup.Cancel();
            }
            clearInterval(this.updateTimestampTimer);
            this.updateTimestampTimer = null;
        });
		
        this.DrawWindowContent();
        this.updateTimestampTimer = setInterval(()=>{this.UpdateTimestamp();}, 100);
    }

    private FormatFromSeconds(totalSeconds: number): string{
        const minutes = Math.floor(totalSeconds/60);
        const seconds = Math.floor(totalSeconds - minutes * 60);
        if(seconds < 10){
            return minutes + ":0" + seconds;
        }
        return minutes + ":" + seconds;
    }

    private UpdateTimestamp(): void{
        if(this.timestamp && this.timestamp.current){
            if(!this.currentAudio || !this.currentAudio.duration){
                this.timestamp.current.SetTitle("0:00 / 0:00");
            }else{
                const text = this.FormatFromSeconds(this.currentAudio.currentTime) + " / " + this.FormatFromSeconds(this.currentAudio.duration);
                this.timestamp.current.SetTitle(text);
            }
        }
    }

	private SetVolume(volume: number): void{
        this.volume = volume;
		if(this.currentAudio){
			this.currentAudio.volume = this.volume;
		}
    }
	
	private PlaySong(index: number): void{
        this.lastTrack = index;
        this.InitAudio(index);
        this.currentAudio.play();
    }

    private InitAudio(index: number): void{
		if(this.currentAudio){
			this.currentAudio.pause();
		}
		const song = this.tracks[index];
		this.currentAudio = new Audio("Assets/music/"+song.filename);
        this.currentAudio.volume = this.volume;
        if(this.songTitleLabel && this.songTitleLabel.current){
            this.songTitleLabel.current.SetTitle("Playing \"" + song.title + "\"");
        }
		$(this.currentAudio).on("ended", () => {
            this.trackSelect.current.SetSelection((index+1)%this.tracks.length, false);
        });
    }
    
    private AudioControlPlay(): void{
        if(this.currentAudio){
            this.currentAudio.play();
        }
    }
    
    private AudioControlPause(): void{
        if(this.currentAudio){
            this.currentAudio.pause();
        }
    }
    
    private AudioControlStop(): void{
        if(this.currentAudio){
            this.currentAudio.pause();
            this.InitAudio(this.lastTrack);
        }
    }

    public DrawWindowContent(): void{
		if(!this.windowObj) return;
        this.windowObj.contentDiv.empty();

        const options = this.tracks.map((track) => {
            return {
                title: track.title,
                tooltip: track.title,
                icon: AllIcons.Music
            };
        });

        const nowrap = { textOverflow: "ellipsis", display: "block", overflowX: "hidden", whiteSpace: "nowrap", marginTop: "-4px", marginLeft: "6px" };
        const right = { float: "right", marginRight: "10px", marginTop: "9px" };

        let curTitle = "Choose a song.";
        if(this.lastTrack >= 0 && this.lastTrack < this.tracks.length){
            const song = this.tracks[this.lastTrack];
            curTitle = "Playing \"" + song.title + "\"";
        }
        
        ReactDom.render(
            <React.Fragment>
                <div> {/* Top section */}
                    <SelectionListWidget ref={this.trackSelect = React.createRef<SelectionListWidget>()} items={options} height={150} width={335} defaultIndex={this.lastTrack} />
                    <SliderWidget ref={this.volumeSlider = React.createRef<SliderWidget>()} min={0} max={1} label={"Volume"} defaultValue={0.5} suffix={"%"} width={335} darkBar={true} />
                </div>
                <div> {/* Bottom section */}
                    <div>
                        <LabelWidget ref={this.songTitleLabel = React.createRef<LabelWidget>()} title={curTitle} style={nowrap} />
                    </div>
                    <ButtonWidget icon={AllIcons.Play} tooltip="Play" onClick={()=>{this.AudioControlPlay();}} />
                    <ButtonWidget icon={AllIcons.Pause} tooltip="Pause" onClick={()=>{this.AudioControlPause();}} />
                    <ButtonWidget icon={AllIcons.Stop} tooltip="Stop" onClick={()=>{this.AudioControlStop();}} />
                    <LabelWidget ref={this.timestamp = React.createRef<LabelWidget>()} size={28} title="0:00 / 0:00" style={right} />
                    {/* TODO button */}
                </div>
            </React.Fragment>
        , this.windowObj.contentDiv[0]);

        this.trackSelect.current.on("selectionChanged", () => {
            this.PlaySong(this.trackSelect.current.selectedIndex);
        });

        this.volumeSlider.current.on("changed", () => {
            this.SetVolume(this.volumeSlider.current.GetValue());
        });
    }
}