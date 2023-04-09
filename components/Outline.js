const regex = /^#{1,6} /;

export default function Outline({ value, onClick }) {
    const toc = value => {
        value = value.split("\n");
        let headings = [];
        for (let line = 0; line < value.length; line++) {
            const curr = value[line];
            if (curr.startsWith("```") && line != value.length - 1) {
                // Skip code blocks
                line++;
                while (
                    !value[line].startsWith("```") &&
                    !(line === value.length - 1)
                )
                    line++;
                continue;
            }

            if (regex.test(curr)) {
                let type = regex.exec(curr)[0];
                headings.push({
                    line,
                    heading: curr.slice(type.length),
                    type: type.trim()
                });
            }
        }
        return headings;
    };

    return (
        <div className="prose-md prose">
            {toc(value).map((x, idx) => (
                <p
                    className={`!mt-0 !mb-1 cursor-pointer no-underline`}
                    key={x.line}
                    onClick={() => onClick(x.line + 1)}>
                    <a className="no-underline">
                        <b className="font-extrabold">{x.type}</b> {x.heading}
                    </a>
                </p>
            ))}
        </div>
    );
}
