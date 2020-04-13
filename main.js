const getVideosPlaylistPage = () => {
    const playlist = document.querySelector('ytd-playlist-video-list-renderer.ytd-item-section-renderer');
    if (!playlist) return;

    const getVideoCount = () => {
        try {
            const stats = document
                .querySelector('h1#title')
                .nextElementSibling
                .nextElementSibling;
            const count = stats.querySelector('yt-formatted-string').textContent.split(' ')[0];
            return parseInt(count);
        } catch (err) {
            return;
        }
    }

    try {
        const contents = playlist.querySelector('#contents');
        const videos = contents.querySelectorAll('span.ytd-thumbnail-overlay-time-status-renderer');
        return videos.length === getVideoCount() ? videos : null;
    } catch (err) {
        return;
    }
}

const getVideosRegularPage = () => {
    const playlist = document.querySelector('#playlist');
    if (!playlist) return;

    const getVideoCount = () => {
        try {
            const spans = document
                .querySelector('yt-formatted-string.index-message.style-scope.ytd-playlist-panel-renderer')
                .getElementsByTagName('span');
            const last = spans[spans.length - 1];
            return parseInt(last.textContent);
        } catch (err) {
            return;
        }
    }

    try {
        const items = playlist.querySelector('#items');
        const videos = items.querySelectorAll('span.ytd-thumbnail-overlay-time-status-renderer');
        return videos.length === getVideoCount() ? videos : null;
    } catch (err) {
        return;
    }
}

const getPlaylistLength = videos => {
    if (!videos) return;

    const durations = [];
    videos.forEach(v => durations.push(v.innerText));

    const convertTimestringToSeconds = duration => {
        if (!duration) return 0;

        duration = duration
            .split(':')
            .map(t => +t)
            .filter(t => t);

        while (duration.length > 1) {
            duration[1] += duration[0] * 60;
            duration = duration.slice(1);
        }
        return duration[0];
    }

    const totalSeconds = durations.reduce((acc, cur) => acc + convertTimestringToSeconds(cur), 0);

    const getPreparedDuration = duration => {
        const hours = parseInt(duration / 3600);
        const minutes = parseInt((duration - hours * 3600) / 60);
        const seconds = duration - hours * 3600 - minutes * 60;

        return [seconds, minutes, hours].filter(x => x);
    }

    const getPrettyOutput = duration => {
        const labels = ['second', 'minute', 'hour'];

        return duration
            .map((t, i) => t ? t > 1 ? `${t} ${labels[i]}s` : `${t} ${labels[i]}` : null)
            .filter(x => x)
            .reverse()
            .join(' ');
    }

    return getPrettyOutput(getPreparedDuration(totalSeconds));
}

const injectDurationNearTitle = (isPlaylistPage, value) => {
    const duration = document.createElement('small');
    duration.setAttribute('id', 'yt-playlist-duration');
    duration.textContent = value;
    duration.style.color = 'gray';

    const titleBox = isPlaylistPage
        ? document.querySelector('h1#title')
        : document.querySelector('yt-formatted-string.title');

    titleBox.after(duration);
}

const removeOldLabel = () => {
    const oldDuration = document.querySelector('#yt-playlist-duration');
    if (oldDuration) {
        oldDuration.parentNode.removeChild(oldDuration);
        return true;
    }
}

const runner = () => {
    let n = 0;
    let interval;
    if (removeOldLabel()) {
        setTimeout(() => {
            interval = setInterval(checker, 100);
        }, 1000)
    } else {
        interval = setInterval(checker, 100);
    }



    function checker() {
        const { location: { pathname } } = window;

        const isPlaylistPage = pathname.slice(1) === 'playlist';
        const data = isPlaylistPage ? getVideosPlaylistPage() : getVideosRegularPage();
        n += 1;

        if (data || n >= 30) {
            injectDurationNearTitle(isPlaylistPage, getPlaylistLength(data));
            clearInterval(interval);
        }
    }
}

const getPlaylistId = search => {
    let playlist = search.split('list=')[1] || '';
    const pos = playlist.indexOf('&');
    if (pos > -1) {
        playlist = playlist.substring(0, pos);
    }
    return playlist;
}

let oldPlaylist = '';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const playlist = getPlaylistId(window.location.search);
    if (message.updated && oldPlaylist !== playlist) {
        oldPlaylist = playlist;
        runner();
    }
});
