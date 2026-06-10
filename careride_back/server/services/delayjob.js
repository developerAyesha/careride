


const Jobs = [];
let timer = null;


function addJob(par) {
	Jobs.push(par);

	startCron();
}

function startCron() {

	if (!Jobs[0]) {
		clearTimeout(timer);
		timer = null;
		return;
	}

	if (!timer) {
		timer = setTimeout(tick, 10000);
	}
}

async function tick() {
	clearTimeout(timer);
	timer = null;

	let time = new Date();
	for (let i in Jobs) {
		//console.log('job=', Jobs[i].id, Jobs[i].time);
		if (Jobs[i].time < time) {
			await Jobs[i].fn(Jobs[i]);
			Jobs.splice(i, 1);
		}
	}

	startCron();
}







module.exports = {
  addJob
};

