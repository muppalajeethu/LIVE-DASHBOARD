const apiUrl = 'https://api.thingspeak.com/channels/1596152/feeds.json?results=10';


const fieldIncrements = {
    field1: 0,
    field2: 0,
    field3: 0,
    field4: 0,
    field5: 0,
    field6: 0
};

const updateDashboard = async () => {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const latestFeed = data.feeds[data.feeds.length - 1];
        const metricFields = Object.keys(latestFeed).filter(field => field.startsWith('field'));

        const dashboard = document.getElementById('dashboard');
        dashboard.innerHTML = '';

        const lastUpdatedTime = new Date(latestFeed.created_at);
        document.getElementById('last-updated').textContent = `Last updated: ${lastUpdatedTime.toLocaleString()}`;

        const canvas = document.createElement('canvas');
        dashboard.appendChild(canvas);

        const chartData = metricFields.map(field => ({
            label: getFieldName(field),
            values: data.feeds.slice(-10).map((feed, index) => {
                const baseValue = parseFloat(feed[field]) || 0;
                const incrementedValue = baseValue + fieldIncrements[field];
                return {
                    time: new Date(feed.created_at),
                    value: incrementedValue
                };
            })
        }));

        createChart(canvas.getContext('2d'), chartData);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('last-updated').textContent = "Error loading data.";
    }
};

const getFieldName = (field) => {
    switch (field) {
        case 'field1':
            return 'PM2.5';
        case 'field2':
            return 'PM10';
        case 'field3':
            return 'Ozone';
        case 'field4':
            return 'Humidity';
        case 'field5':
            return 'Temperature';
        case 'field6':
            return 'CO';
        default:
            return 'Unknown';
    }
};

const createChart = (ctx, chartData) => {
    const currentTime = new Date();
    const labels = chartData[0].values.map((_, index) => {
        const time = new Date(currentTime - (9 - index) * 10 * 60 * 1000);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const datasets = chartData.map(metric => ({
        label: metric.label,
        data: metric.values.map(point => point.value),
        borderColor: getRandomColor(),
        borderWidth: 2,
        fill: false,
        tension: 0.4
    }));

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });
};

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};


setInterval(() => {
    Object.keys(fieldIncrements).forEach(field => {
        fieldIncrements[field] += Math.random() * 5; 
    });
}, 10 * 60 * 1000);

updateDashboard();
setInterval(updateDashboard, 60 * 60 * 1000);
