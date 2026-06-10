
const STATES = [
	{id: 01, t:'Alabama', c:'AL' },
	{id: 02, t:'Alaska', c:'AK' },
	{id: 04, t:'Arizona', c:'AZ' },
	{id: 05, t:'Arkansas', c:'AR' },
	{id: 06, t:'California', c:'CA' },
	{id: 08, t:'Colorado', c:'CO' },
	{id: 09, t:'Connecticut', c:'CT' },
	{id: 10, t:'Delaware', c:'DE' },
	{id: 11, t:'District of Columbia', c:'DC' },
	{id: 12, t:'Florida', c:'FL' },
	{id: 13, t:'Georgia', c:'GA' },
	{id: 15, t:'Hawaii', c:'HI' },
	{id: 16, t:'Idaho', c:'ID' },
	{id: 17, t:'Illinois', c:'IL' },
	{id: 18, t:'Indiana', c:'IN' },
	{id: 19, t:'Iowa', c:'IA' },
	{id: 20, t:'Kansas', c:'KS' },
	{id: 21, t:'Kentucky', c:'KY' },
	{id: 22, t:'Louisiana', c:'LA' },
	{id: 23, t:'Maine', c:'ME' },
	{id: 24, t:'Maryland', c:'MD' },
	{id: 25, t:'Massachusetts', c:'MA' },
	{id: 26, t:'Michigan', c:'MI' },
	{id: 27, t:'Minnesota', c:'MN' },
	{id: 28, t:'Mississippi', c:'MS' },
	{id: 29, t:'Missouri', c:'MO' },
	{id: 30, t:'Montana', c:'MT' },
	{id: 31, t:'Nebraska', c:'NE' },
	{id: 32, t:'Nevada', c:'NV' },
	{id: 33, t:'New Hampshire', c:'NH' },
	{id: 34, t:'New Jersey', c:'NJ' },
	{id: 35, t:'New Mexico', c:'NM' },
	{id: 36, t:'New York', c:'NY' },
	{id: 37, t:'North Carolina', c:'NC' },
	{id: 38, t:'North Dakota', c:'ND' },
	{id: 39, t:'Ohio', c:'OH' },
	{id: 40, t:'Oklahoma', c:'OK' },
	{id: 41, t:'Oregon', c:'OR' },
	{id: 42, t:'Pennsylvania', c:'PA' },
	{id: 44, t:'Rhode Island', c:'RI' },
	{id: 45, t:'South Carolina', c:'SC' },
	{id: 46, t:'South Dakota', c:'SD' },
	{id: 47, t:'Tennessee', c:'TN' },
	{id: 48, t:'Texas', c:'TX' },
	{id: 49, t:'Utah', c:'UT' },
	{id: 50, t:'Vermont', c:'VT' },
	{id: 51, t:'Virginia', c:'VA' },
	{id: 53, t:'Washington', c:'WA' },
	{id: 54, t:'West Virginia', c:'WV' },
	{id: 55, t:'Wisconsin', c:'WI' },
	{id: 56, t:'Wyoming', c:'WY' },
];


module.exports.isCode = function(c) {
	const f = STATES.find( function(v, i) {
		return v.c === c;
	});
	return f;
};

module.exports.getList = function() {
	return STATES;
}

