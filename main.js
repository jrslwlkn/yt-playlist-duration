const getVideosPlaylistPage = () => {
    const playlist = document.querySelector('ytd-playlist-video-list-renderer.ytd-item-section-renderer');
    if (!playlist) return;

    try {
        const contents = playlist.querySelector('#contents');
        const videos = contents.querySelectorAll('span.ytd-thumbnail-overlay-time-status-renderer');
    } catch(err) {
        console.warn(err);
        return null;
    }
    
    return videos.length ? videos : null;
}

const getVideosRegularPage = () => {
    const playlist = document.getElementById('playlist')
    if (!playlist) return;

    try {
        const items = playlist.querySelector('#items');
        const videos = items.querySelectorAll('.ytd-thumbnail-overlay-time-status-renderer');
    } catch(err) {
        console.warn(err);
        return null;
    }

    return videos.length ? videos : null;
}

const getPlaylistLength = videos => {
    if (!videos) return;

    const durations = []; 
    videos.forEach(v => durations.push(v.innerText))

    const convertTimestringToSeconds = duration => {
        duration = duration
            .split(':')
            .map(t => +t)
            .filter(t => t)

        while (duration.length > 1) {
            duration[1] += duration[0] * 60;
            duration = duration.slice(1)
        }
        return duration[0];
    }

    const totalSeconds = durations.reduce((acc, cur) => acc + convertTimestringToSeconds(cur), 0)

    const getPreparedDuration = duration => {
        const hours = parseInt(duration/3600)
        const minutes = parseInt((duration - hours*3600)/60)
        const seconds = duration - hours*3600 - minutes*60;

        return [seconds, minutes, hours].filter(x => x)
    }

    const getPrettyOutput = duration => {
        const labels = ['second', 'minute', 'hour']

        return duration
            .map((t, i) => t ? t > 1 ? `${t} ${labels[i]}s` : `${t} ${labels[i]}` : null)
            .filter(x => x)
            .reverse()
            .join(' ')

    }

    return getPrettyOutput(getPreparedDuration(totalSeconds));
}

const isPlaylistPage = () => window.location.pathname.slice(1) === 'playlist';

const data = isPlaylistPage ? getVideosPlaylistPage() : getVideosRegularPage();
if (data) {
    console.log(getPlaylistLength(data))
}