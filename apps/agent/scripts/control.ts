const [command = "status", rawLimit] = process.argv.slice(2);

export {};

const baseUrl = process.env.AGENT_PUBLIC_URL;
const secret = process.env.AGENT_INTERNAL_SECRET;
if (!baseUrl || !secret) {
	throw new Error("需要设置 AGENT_PUBLIC_URL 和 AGENT_INTERNAL_SECRET");
}

const headers = {
	Authorization: `Bearer ${secret}`,
	"Content-Type": "application/json",
};

if (command !== "status") {
	const liveCreatorLimit = Number(rawLimit ?? 3);
	if (
		!["pause", "shadow", "live"].includes(command) ||
		![3, 6, 12].includes(liveCreatorLimit)
	) {
		throw new Error("支持的命令：status、pause、shadow、live 3|6|12");
	}
	const response = await fetch(`${baseUrl}/internal/control`, {
		method: "PUT",
		headers,
		body: JSON.stringify({
			liveCreatorLimit,
			mode: command === "pause" ? "paused" : command,
		}),
	});
	if (!response.ok) throw new Error(`控制请求失败：${response.status}`);
}

const response = await fetch(`${baseUrl}/internal/control`, { headers });
if (!response.ok) throw new Error(`状态请求失败：${response.status}`);
console.log(await response.json());
