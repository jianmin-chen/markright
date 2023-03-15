const regex = /^#{1,6} /;

export default function Outline({ value, onClick }) {
    const toc = value => {
        const headings = value.split("\n").flatMap((heading, line) => {
            if (regex.test(heading)) {
                let type = regex.exec(heading)[0];
                return {
                    line,
                    heading: heading.slice(type.length),
                    type: type.trim()
                };
            }
            return [];
        });
        return headings;
    };

    return (
        <div className="prose-md prose">
            {toc(value).map((x, idx) => (
                <p
                    className={`!mt-0 !mb-1 cursor-pointer no-underline`}
                    key={x.line}>
                    <a
                        className="no-underline"
                        onClick={() => onClick(x.line + 1)}>
                        <b className="font-extrabold">{x.type}</b> {x.heading}
                    </a>
                </p>
            ))}
        </div>
    );
}
